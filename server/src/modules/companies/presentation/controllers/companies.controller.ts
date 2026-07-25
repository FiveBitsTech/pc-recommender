import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard'
import { Roles } from '../../../../shared/security/roles.decorator'
import { RolesGuard } from '../../../../shared/security/roles.guard'
import { GenerateScrapeConfigUseCase } from '../../application/use-cases/generate-scrape-config.use-case'
import { ListAllCompaniesUseCase } from '../../application/use-cases/list-all-companies.use-case'
import { ListCompaniesUseCase } from '../../application/use-cases/list-companies.use-case'
import { UpdateCompanyUseCase } from '../../application/use-cases/update-company.use-case'
import { UpsertCompanyUseCase } from '../../application/use-cases/upsert-company.use-case'
import { UpdateCompanyDto, UpsertCompanyDto } from '../dto/company.dto'
import { GenerateScrapeConfigDto } from '../dto/generate-scrape-config.dto'

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly listCompaniesUseCase: ListCompaniesUseCase,
    private readonly listAllCompaniesUseCase: ListAllCompaniesUseCase,
    private readonly upsertCompanyUseCase: UpsertCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly generateScrapeConfigUseCase: GenerateScrapeConfigUseCase,
  ) {}

  @Get()
  findAll() {
    return this.listCompaniesUseCase.execute()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  findAllAdmin() {
    return this.listAllCompaniesUseCase.execute()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('generate-scrape-config')
  generateScrapeConfig(@Body() body: GenerateScrapeConfigDto) {
    return this.generateScrapeConfigUseCase.execute(body)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  upsert(@Body() body: UpsertCompanyDto) {
    return this.upsertCompanyUseCase.execute(body)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCompanyDto) {
    return this.updateCompanyUseCase.execute(id, body)
  }
}
