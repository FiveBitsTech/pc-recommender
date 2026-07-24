import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import {
  COMPANY_REPOSITORY,
  type CompanyRecord,
  type CompanyRepository,
} from '../../../companies/domain/repositories/company.repository'
import {
  SCRAPING_REPOSITORY,
  type ScrapingRepository,
} from '../../domain/repositories/scraping.repository'
import { PlaywrightStoreProbe } from '../../infrastructure/adapters/playwright-store-probe'
import type { ScrapedBatch } from '../../domain/ports/store-scraper.port'
import { IngestScrapedBatchUseCase } from './ingest-scraped-batch.use-case'

type ScrapeConfigLike = {
  baseUrl?: string
  categories?: Array<{ url?: string }>
  sampleProductUrl?: string
}

@Injectable()
export class RunScrapingUseCase {
  private readonly logger = new Logger(RunScrapingUseCase.name)

  constructor(
    private readonly ingestScrapedBatch: IngestScrapedBatchUseCase,
    private readonly probe: PlaywrightStoreProbe,
    @Inject(SCRAPING_REPOSITORY) private readonly scrapingRepository: ScrapingRepository,
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(input: { companyId: number; dryRun?: boolean }) {
    if (!input.companyId) {
      throw new BadRequestException('Indica companyId')
    }

    return this.executeForCompany(input.companyId, { dryRun: input.dryRun })
  }

  private async executeForCompany(companyId: number, options?: { dryRun?: boolean }) {
    const company = await this.companyRepository.findById(companyId)
    if (!company) throw new NotFoundException('Empresa no encontrada')

    const batch = await this.buildBatchFromCompany(company)
    return this.persistOrPreview(batch, options, company.id)
  }

  private async buildBatchFromCompany(company: CompanyRecord): Promise<ScrapedBatch> {
    const config = (company.scrapeConfig || {}) as ScrapeConfigLike
    const baseUrl =
      (typeof config.baseUrl === 'string' && config.baseUrl.trim()) ||
      (typeof config.categories?.[0]?.url === 'string' && config.categories[0].url.trim()) ||
      company.website ||
      ''

    if (!baseUrl) {
      throw new BadRequestException(
        `La empresa "${company.name}" no tiene website ni scrapeConfig.baseUrl para scrapear`,
      )
    }

    this.logger.log(`Company ${company.slug}: scrapeConfig url=${baseUrl}`)

    return this.probe.probe({
      source: company.slug,
      adapter: 'company-scrape-config-v1',
      company: {
        slug: company.slug,
        name: company.name,
        website: company.website || baseUrl,
      },
      baseUrl,
      limit: Number(process.env.SCRAPE_PRODUCT_LIMIT ?? 2000),
    })
  }

  private async persistOrPreview(
    batch: ScrapedBatch,
    options?: { dryRun?: boolean },
    knownCompanyId?: number,
  ) {
    let companyIdForHistory: number | null = knownCompanyId ?? null

    try {
      if (options?.dryRun) {
        return {
          status: 'preview' as const,
          dryRun: true,
          persisted: false,
          source: batch.run.source,
          adapter: batch.run.adapter,
          scrapedAt: batch.run.scrapedAt,
          company: batch.company,
          productsFound: batch.products.length,
          products: batch.products,
          note: 'Dry run — nothing was saved. Call again without dryRun to persist.',
        }
      }

      const result = await this.ingestScrapedBatch.execute(batch)
      companyIdForHistory = result.companyId

      const previous = await this.scrapingRepository.findLatestSuccessBySource(batch.run.source)
      let yieldWarning: string | null = null
      if (previous && previous.productsFound > 0) {
        const ratio = result.productsIngested / previous.productsFound
        if (ratio < 0.5) {
          yieldWarning = `Yield drop: ${result.productsIngested} vs previous ${previous.productsFound} (${Math.round(ratio * 100)}%). Possible HTML/selector change.`
          this.logger.warn(`Scraping ${batch.run.source}: ${yieldWarning}`)
        }
      }

      const history = await this.scrapingRepository.create({
        companyId: result.companyId,
        source: batch.run.source,
        status: 'success',
        productsFound: result.productsIngested,
      })

      this.logger.log(
        `Scraping OK source=${batch.run.source} products=${result.productsIngested}`,
      )

      return {
        status: 'success' as const,
        dryRun: false,
        persisted: true,
        source: batch.run.source,
        adapter: batch.run.adapter,
        companyId: result.companyId,
        productsFound: result.productsIngested,
        historyId: history.id,
        yieldWarning,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(`Scraping failed source=${batch.run.source}: ${message}`)

      if (companyIdForHistory != null) {
        await this.scrapingRepository.create({
          companyId: companyIdForHistory,
          source: batch.run.source,
          status: 'failed',
          productsFound: 0,
          errorMessage: message,
        })
      }

      throw error
    }
  }
}
