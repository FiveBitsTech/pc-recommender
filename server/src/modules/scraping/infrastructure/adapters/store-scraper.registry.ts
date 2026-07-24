import { Injectable } from '@nestjs/common'
import type { StoreScraper } from '../../domain/ports/store-scraper.port'
import { FixtureStoreScraper } from '../adapters/fixture.adapter'
import { MemoryKingsStoreScraper } from '../adapters/memory-kings.adapter'
import {
  CyccomputerStoreScraper,
  DeltronStoreScraper,
  ImpactoStoreScraper,
} from '../adapters/peru-stores.adapters'

@Injectable()
export class StoreScraperRegistry {
  constructor(
    private readonly fixture: FixtureStoreScraper,
    private readonly memoryKings: MemoryKingsStoreScraper,
    private readonly cyccomputer: CyccomputerStoreScraper,
    private readonly impacto: ImpactoStoreScraper,
    private readonly deltron: DeltronStoreScraper,
  ) {}

  resolve(source: string): StoreScraper {
    const key = source.trim().toLowerCase()
    if (key === 'fixture') return this.fixture
    if (key === 'memory-kings' || key === 'live') return this.memoryKings
    if (key === 'cyccomputer') return this.cyccomputer
    if (key === 'impacto') return this.impacto
    if (key === 'deltron') return this.deltron
    throw new Error(`Unknown scraping source: ${source}`)
  }

  listSources(): string[] {
    return ['fixture', 'memory-kings', 'cyccomputer', 'impacto', 'deltron']
  }

  hasSource(source: string): boolean {
    try {
      this.resolve(source)
      return true
    } catch {
      return false
    }
  }
}
