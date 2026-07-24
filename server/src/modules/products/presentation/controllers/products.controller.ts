import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard'
import { Roles } from '../../../../shared/security/roles.decorator'
import { RolesGuard } from '../../../../shared/security/roles.guard'
import {
  DeleteAdminComparisonUseCase,
  ListAdminComparisonsUseCase,
} from '../../application/use-cases/admin-comparisons.use-case'
import {
  DeleteAdminRecommendationUseCase,
  ListAdminRecommendationsUseCase,
} from '../../application/use-cases/admin-recommendations.use-case'
import { DeleteAdminProductUseCase } from '../../application/use-cases/delete-admin-product.use-case'
import { DeleteProductTagUseCase } from '../../application/use-cases/delete-product-tag.use-case'
import { GetAdminProductUseCase } from '../../application/use-cases/get-admin-product.use-case'
import { ListAdminPricesUseCase } from '../../application/use-cases/list-admin-prices.use-case'
import { ListAdminProductsUseCase } from '../../application/use-cases/list-admin-products.use-case'
import { ListAdminSpecsUseCase } from '../../application/use-cases/list-admin-specs.use-case'
import { ListProductTagsUseCase } from '../../application/use-cases/list-product-tags.use-case'
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case'
import { UpdateAdminProductUseCase } from '../../application/use-cases/update-admin-product.use-case'
import { ListAdminProductsQueryDto, UpdateAdminProductDto } from '../dto/update-admin-product.dto'

@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly listAdminProductsUseCase: ListAdminProductsUseCase,
    private readonly getAdminProductUseCase: GetAdminProductUseCase,
    private readonly updateAdminProductUseCase: UpdateAdminProductUseCase,
    private readonly deleteAdminProductUseCase: DeleteAdminProductUseCase,
    private readonly listProductTagsUseCase: ListProductTagsUseCase,
    private readonly deleteProductTagUseCase: DeleteProductTagUseCase,
    private readonly listAdminPricesUseCase: ListAdminPricesUseCase,
    private readonly listAdminSpecsUseCase: ListAdminSpecsUseCase,
    private readonly listAdminComparisonsUseCase: ListAdminComparisonsUseCase,
    private readonly deleteAdminComparisonUseCase: DeleteAdminComparisonUseCase,
    private readonly listAdminRecommendationsUseCase: ListAdminRecommendationsUseCase,
    private readonly deleteAdminRecommendationUseCase: DeleteAdminRecommendationUseCase,
  ) {}

  @Get()
  findAll() {
    return this.listProductsUseCase.execute()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  findAllAdmin(@Query() query: ListAdminProductsQueryDto) {
    return this.listAdminProductsUseCase.execute({
      q: query.q,
      companyId: query.companyId,
    })
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/tags')
  listTags() {
    return this.listProductTagsUseCase.execute()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/tags/:id')
  deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.deleteProductTagUseCase.execute(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/prices')
  listPrices() {
    return this.listAdminPricesUseCase.execute()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/specs')
  listSpecs() {
    return this.listAdminSpecsUseCase.execute()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/comparisons')
  listComparisons() {
    return this.listAdminComparisonsUseCase.execute()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/comparisons/:id')
  deleteComparison(@Param('id', ParseIntPipe) id: number) {
    return this.deleteAdminComparisonUseCase.execute(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/recommendations')
  listRecommendations() {
    return this.listAdminRecommendationsUseCase.execute()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/recommendations/:id')
  deleteRecommendation(@Param('id', ParseIntPipe) id: number) {
    return this.deleteAdminRecommendationUseCase.execute(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/:id')
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.getAdminProductUseCase.execute(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id')
  updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAdminProductDto) {
    return this.updateAdminProductUseCase.execute(id, body)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/:id')
  removeAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.deleteAdminProductUseCase.execute(id)
  }
}
