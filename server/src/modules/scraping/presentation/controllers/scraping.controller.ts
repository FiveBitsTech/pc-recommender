import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserRole } from '@prisma/client'
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard'
import { Roles } from '../../../../shared/security/roles.decorator'
import { RolesGuard } from '../../../../shared/security/roles.guard'
import { ListScrapingHistoryUseCase } from '../../application/use-cases/list-scraping-history.use-case'
import { PreviewScrapingUseCase } from '../../application/use-cases/preview-scraping.use-case'
import { RunScrapingUseCase } from '../../application/use-cases/run-scraping.use-case'
import { StoreScraperRegistry } from '../../infrastructure/adapters/store-scraper.registry'
import { PreviewScrapingDto, RunScrapingDto } from '../dto/run-scraping.dto'

@Controller('scraping')
export class ScrapingController {
  constructor(
    private readonly listScrapingHistoryUseCase: ListScrapingHistoryUseCase,
    private readonly previewScrapingUseCase: PreviewScrapingUseCase,
    private readonly runScrapingUseCase: RunScrapingUseCase,
    private readonly registry: StoreScraperRegistry,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('history')
  findHistory() {
    return this.listScrapingHistoryUseCase.execute()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('sources')
  listSources() {
    return {
      sources: this.registry.listSources(),
      mode: this.config.get<string>('SCRAPE_MODE') ?? 'fixture',
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('preview')
  preview(@Body() body: PreviewScrapingDto) {
    return this.previewScrapingUseCase.execute(body.source, body.limit)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('run')
  run(@Body() body: RunScrapingDto) {
    if (!body.companyId && !body.source) {
      const fallback =
        this.config.get<string>('SCRAPE_MODE') === 'live' ? 'memory-kings' : 'fixture'
      return this.runScrapingUseCase.execute({ source: fallback, dryRun: body.dryRun === true })
    }

    return this.runScrapingUseCase.execute({
      companyId: body.companyId,
      source: body.source,
      dryRun: body.dryRun === true,
    })
  }
}
