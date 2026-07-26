import { Module } from '@nestjs/common'
import {
  DeleteAdminComparisonUseCase,
  ListAdminComparisonsUseCase,
} from './application/use-cases/admin-comparisons.use-case'
import {
  DeleteAdminRecommendationUseCase,
  ListAdminRecommendationsUseCase,
} from './application/use-cases/admin-recommendations.use-case'
import { DeleteAdminProductUseCase } from './application/use-cases/delete-admin-product.use-case'
import { DeleteProductTagUseCase } from './application/use-cases/delete-product-tag.use-case'
import { GetAdminProductUseCase } from './application/use-cases/get-admin-product.use-case'
import { ListAdminPricesUseCase } from './application/use-cases/list-admin-prices.use-case'
import { ListAdminProductsUseCase } from './application/use-cases/list-admin-products.use-case'
import { ListAdminSpecsUseCase } from './application/use-cases/list-admin-specs.use-case'
import { ListProductTagsUseCase } from './application/use-cases/list-product-tags.use-case'
import { ListProductsUseCase } from './application/use-cases/list-products.use-case'
import { UpdateAdminProductUseCase } from './application/use-cases/update-admin-product.use-case'
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository'
import { PrismaProductRepository } from './infrastructure/prisma/prisma-product.repository'
import { ProductsController } from './presentation/controllers/products.controller'

@Module({
  controllers: [ProductsController],
  providers: [
    ListProductsUseCase,
    ListAdminProductsUseCase,
    GetAdminProductUseCase,
    UpdateAdminProductUseCase,
    DeleteAdminProductUseCase,
    ListProductTagsUseCase,
    DeleteProductTagUseCase,
    ListAdminPricesUseCase,
    ListAdminSpecsUseCase,
    ListAdminComparisonsUseCase,
    DeleteAdminComparisonUseCase,
    ListAdminRecommendationsUseCase,
    DeleteAdminRecommendationUseCase,
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
