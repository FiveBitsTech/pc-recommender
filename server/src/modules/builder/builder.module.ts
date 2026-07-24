import { Module } from '@nestjs/common'
import { BuildPCUseCase } from './application/use-cases/build-pc.use-case'
import { BuilderController } from './presentation/controllers/builder.controller'
import { ProductsModule } from '../products/products.module'

@Module({
  imports: [ProductsModule],
  controllers: [BuilderController],
  providers: [BuildPCUseCase],
})
export class BuilderModule {}
