import { Module } from '@nestjs/common'
import { ListTagsUseCase } from './application/use-cases/list-tags.use-case'
import { TAG_REPOSITORY } from './domain/repositories/tag.repository'
import { PrismaTagRepository } from './infrastructure/prisma/prisma-tag.repository'
import { TagsController } from './presentation/controllers/tags.controller'

@Module({
  controllers: [TagsController],
  providers: [ListTagsUseCase, { provide: TAG_REPOSITORY, useClass: PrismaTagRepository }],
  exports: [TAG_REPOSITORY],
})
export class TagsModule {}
