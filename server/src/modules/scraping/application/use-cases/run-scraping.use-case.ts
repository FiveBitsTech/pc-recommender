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
import { ScrapingProgressService } from '../../infrastructure/scraping-progress.service'
import type { ScrapedBatch, ScrapedProductItem } from '../../domain/ports/store-scraper.port'
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
    private readonly progress: ScrapingProgressService,
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

    this.progress.start(companyId, company.slug)

    try {
      return options?.dryRun
        ? await this.runDryRun(company, companyId)
        : await this.runAndPersist(company, companyId)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(`Scraping failed source=${company.slug}: ${message}`)
      this.progress.fail(companyId, message)

      await this.scrapingRepository.create({
        companyId,
        source: company.slug,
        status: 'failed',
        productsFound: 0,
        errorMessage: message,
      })

      throw error
    }
  }

  private async runDryRun(company: CompanyRecord, companyId: number) {
    const batch = await this.runProbe(company, companyId)
    this.progress.finish(companyId, batch.products.length)

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

  private async runAndPersist(company: CompanyRecord, companyId: number) {
    // La empresa se crea antes del crawl para poder guardar cada ficha apenas se scrapea.
    const companyRecord = await this.ingestScrapedBatch.upsertCompany({
      slug: company.slug,
      name: company.name,
      website: company.website ?? null,
    })

    let persisted = 0
    const batch = await this.runProbe(company, companyId, async item => {
      const saved = await this.ingestScrapedBatch.ingestProduct(companyRecord.id, item)
      if (saved) {
        persisted += 1
        this.progress.setPersisted(companyId, persisted)
      }
    })

    this.progress.setIngest(companyId, persisted)

    const previous = await this.scrapingRepository.findLatestSuccessBySource(batch.run.source)
    let yieldWarning: string | null = null
    if (previous && previous.productsFound > 0) {
      const ratio = persisted / previous.productsFound
      if (ratio < 0.5) {
        yieldWarning = `Yield drop: ${persisted} vs previous ${previous.productsFound} (${Math.round(ratio * 100)}%). Possible HTML/selector change.`
        this.logger.warn(`Scraping ${batch.run.source}: ${yieldWarning}`)
      }
    }

    const history = await this.scrapingRepository.create({
      companyId: companyRecord.id,
      source: batch.run.source,
      status: 'success',
      productsFound: persisted,
    })

    this.progress.finish(companyId, persisted)
    this.logger.log(`Scraping OK source=${batch.run.source} products=${persisted}`)

    return {
      status: 'success' as const,
      dryRun: false,
      persisted: true,
      source: batch.run.source,
      adapter: batch.run.adapter,
      companyId: companyRecord.id,
      productsFound: persisted,
      historyId: history.id,
      yieldWarning,
    }
  }

  private async runProbe(
    company: CompanyRecord,
    companyId: number,
    onProduct?: (item: ScrapedProductItem) => Promise<void>,
  ): Promise<ScrapedBatch> {
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

    this.logger.log(
      `Company ${company.slug}: scrapeConfig url=${baseUrl} categories=${config.categories?.length ?? 0}`,
    )

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
      scrapeConfig: company.scrapeConfig,
      onProduct,
      onProgress: event => {
        if (event.phase === 'listing') {
          this.progress.setListing(companyId, event.message)
          return
        }
        if (typeof event.total === 'number' && (event.visited ?? 0) === 0) {
          this.progress.setProductsTotal(companyId, event.total)
          return
        }
        this.progress.tickProduct(companyId, event.visited ?? 0, event.total)
      },
    })
  }
}
