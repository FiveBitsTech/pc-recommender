import { Controller, Get } from '@nestjs/common'
import { ListScrapingHistoryUseCase } from '../../application/use-cases/list-scraping-history.use-case'

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly listScrapingHistoryUseCase: ListScrapingHistoryUseCase) {}

  @Get('history')
  findHistory() {
    return this.listScrapingHistoryUseCase.execute()
  }
}
