import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './modules/auth/auth.module'
import { CompaniesModule } from './modules/companies/companies.module'
import { ComparisonsModule } from './modules/comparisons/comparisons.module'
import { ProductsModule } from './modules/products/products.module'
import { RecommendationsModule } from './modules/recommendations/recommendations.module'
import { RequirementsModule } from './modules/requirements/requirements.module'
import { ScrapingModule } from './modules/scraping/scraping.module'
import { TagsModule } from './modules/tags/tags.module'
import { OpenAIModule } from './shared/openai/openai.module'
import { PrismaModule } from './shared/prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Solo .env: evita conflictos con .env.development / .env.local entre devs
      envFilePath: ['.env'],
    }),
    PrismaModule,
    OpenAIModule,
    ScheduleModule.forRoot(),
    AuthModule,
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
