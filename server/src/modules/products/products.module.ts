import { Module } from '@nestjs/common'
import { ListProductsUseCase } from './application/use-cases/list-products.use-case'
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository'
import { PrismaProductRepository } from './infrastructure/prisma/prisma-product.repository'
import { ProductsController } from './presentation/controllers/products.controller'

@Module({
  controllers: [ProductsController],
  providers: [
    ListProductsUseCase,
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
