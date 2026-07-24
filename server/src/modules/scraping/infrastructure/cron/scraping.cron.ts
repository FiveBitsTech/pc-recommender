import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { RunScrapingUseCase } from '../../application/use-cases/run-scraping.use-case'

@Injectable()
export class ScrapingCron {
  private readonly logger = new Logger(ScrapingCron.name)

  constructor(
    private readonly config: ConfigService,
    private readonly runScraping: RunScrapingUseCase,
  ) {}

  // Default: every day at 03:00 America/Lima (server TZ). Override via SCRAPE_CRON is not
  // dynamically reloaded; change the decorator expression or disable with SCRAPE_CRON_ENABLED=false.
  @Cron(process.env.SCRAPE_CRON ?? '0 3 * * *')
  async handleCron() {
    const enabled = (this.config.get<string>('SCRAPE_CRON_ENABLED') ?? 'true') !== 'false'
    if (!enabled) {
      this.logger.debug('Scraping cron disabled (SCRAPE_CRON_ENABLED=false)')
      return
    }

    const mode = this.config.get<string>('SCRAPE_MODE') ?? 'fixture'
    const sourcesEnv = this.config.get<string>('SCRAPE_SOURCES')
    const sources = sourcesEnv
      ? sourcesEnv.split(',').map((s) => s.trim()).filter(Boolean)
      : [mode === 'live' ? 'memory-kings' : 'fixture']

    for (const source of sources) {
      try {
        await this.runScraping.execute({ source })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.logger.error(`Cron scrape failed source=${source}: ${message}`)
      }
    }
  }
}
