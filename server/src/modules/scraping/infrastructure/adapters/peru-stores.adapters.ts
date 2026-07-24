import { Injectable } from '@nestjs/common'
import type { ScrapedBatch, StoreScraper } from '../../domain/ports/store-scraper.port'
import { PlaywrightStoreProbe } from './playwright-store-probe'

const productLimit = () => Number(process.env.SCRAPE_PRODUCT_LIMIT ?? process.env.SCRAPE_PREVIEW_LIMIT ?? 100)

@Injectable()
export class CyccomputerStoreScraper implements StoreScraper {
  readonly source = 'cyccomputer'

  constructor(private readonly probe: PlaywrightStoreProbe) {}

  scrape(): Promise<ScrapedBatch> {
    return this.probe.probe({
      source: this.source,
      adapter: 'cyccomputer-live-v1',
      company: {
        slug: 'cyccomputer',
        name: 'CYC Computer',
        website: 'https://cyccomputer.pe/',
      },
      baseUrl: process.env.CYCCOMPUTER_BASE_URL ?? 'https://cyccomputer.pe/',
      limit: productLimit(),
    })
  }
}

@Injectable()
export class ImpactoStoreScraper implements StoreScraper {
  readonly source = 'impacto'

  constructor(private readonly probe: PlaywrightStoreProbe) {}

  scrape(): Promise<ScrapedBatch> {
    return this.probe.probe({
      source: this.source,
      adapter: 'impacto-live-v1',
      company: {
        slug: 'impacto',
        name: 'Impacto',
        website: 'https://www.impacto.com.pe/',
      },
      baseUrl: process.env.IMPACTO_BASE_URL ?? 'https://www.impacto.com.pe/',
      limit: productLimit(),
    })
  }
}

@Injectable()
export class DeltronStoreScraper implements StoreScraper {
  readonly source = 'deltron'

  constructor(private readonly probe: PlaywrightStoreProbe) {}

  scrape(): Promise<ScrapedBatch> {
    return this.probe.probe({
      source: this.source,
      adapter: 'deltron-live-v1',
      company: {
        slug: 'deltron',
        name: 'Deltron',
        website: 'https://www.deltron.com.pe/',
      },
      baseUrl: process.env.DELTRON_BASE_URL ?? 'https://www.deltron.com.pe/',
      limit: productLimit(),
    })
  }
}
