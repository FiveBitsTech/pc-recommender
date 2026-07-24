import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard'
import { Roles } from '../../../../shared/security/roles.decorator'
import { RolesGuard } from '../../../../shared/security/roles.guard'
import { ListScrapingHistoryUseCase } from '../../application/use-cases/list-scraping-history.use-case'
import { ClearScrapingCatalogUseCase } from '../../application/use-cases/clear-scraping-catalog.use-case'
import { RunScrapingUseCase } from '../../application/use-cases/run-scraping.use-case'
import { ClearScrapingCatalogDto, RunScrapingDto } from '../dto/run-scraping.dto'

@Controller('scraping')
export class ScrapingController {
  constructor(
    private readonly listScrapingHistoryUseCase: ListScrapingHistoryUseCase,
    private readonly runScrapingUseCase: RunScrapingUseCase,
    private readonly clearScrapingCatalogUseCase: ClearScrapingCatalogUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('history')
  findHistory() {
    return this.listScrapingHistoryUseCase.execute()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('run')
  run(@Body() body: RunScrapingDto) {
    if (!body.companyId) {
      throw new BadRequestException('Indica companyId de la empresa a scrapear')
    }

    return this.runScrapingUseCase.execute({
      companyId: body.companyId,
      dryRun: body.dryRun === true,
    })
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('clear-catalog')
  clearCatalog(@Body() body: ClearScrapingCatalogDto) {
    return this.clearScrapingCatalogUseCase.execute({
      clearProducts: body.clearProducts,
      clearHistory: body.clearHistory,
    })
  }
}
