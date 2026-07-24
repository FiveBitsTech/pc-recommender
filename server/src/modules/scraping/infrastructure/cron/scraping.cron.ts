import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from '../../../companies/domain/repositories/company.repository'
import { RunScrapingUseCase } from '../../application/use-cases/run-scraping.use-case'

@Injectable()
export class ScrapingCron {
  private readonly logger = new Logger(ScrapingCron.name)

  constructor(
    private readonly config: ConfigService,
    private readonly runScraping: RunScrapingUseCase,
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
  ) {}

  @Cron(process.env.SCRAPE_CRON ?? '0 3 * * *')
  async handleCron() {
    const enabled = (this.config.get<string>('SCRAPE_CRON_ENABLED') ?? 'true') !== 'false'
    if (!enabled) {
      this.logger.debug('Scraping cron disabled (SCRAPE_CRON_ENABLED=false)')
      return
    }

    const companies = await this.companyRepository.findAllActive()

    for (const company of companies) {
      try {
        await this.runScraping.execute({ companyId: company.id })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.logger.error(`Cron scrape failed company=${company.slug}: ${message}`)
      }
    }
  }
}
