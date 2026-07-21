import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CompaniesModule } from './modules/companies/companies.module'
import { ComparisonsModule } from './modules/comparisons/comparisons.module'
import { ProductsModule } from './modules/products/products.module'
import { RecommendationsModule } from './modules/recommendations/recommendations.module'
import { RequirementsModule } from './modules/requirements/requirements.module'
import { ScrapingModule } from './modules/scraping/scraping.module'
import { TagsModule } from './modules/tags/tags.module'
import { PrismaModule } from './shared/prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV ?? 'development'}.local`,
        `.env.${process.env.NODE_ENV ?? 'development'}`,
        '.env.local',
        '.env',
      ],
    }),
    PrismaModule,
    CompaniesModule,
    ProductsModule,
    TagsModule,
    RequirementsModule,
    RecommendationsModule,
    ComparisonsModule,
    ScrapingModule,
  ],
})
export class AppModule {}
