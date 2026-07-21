import { Inject, Injectable } from '@nestjs/common'
import {
  SCRAPING_REPOSITORY,
  type ScrapingRepository,
} from '../../domain/repositories/scraping.repository'
import { mapScrapingItem } from '../mappers/map-scraping-item'

@Injectable()
export class ListScrapingHistoryUseCase {
  constructor(
    @Inject(SCRAPING_REPOSITORY) private readonly scrapingRepository: ScrapingRepository,
  ) {}

  async execute() {
    const items = await this.scrapingRepository.findAll()
    return { items: items.map(mapScrapingItem) }
  }
}
