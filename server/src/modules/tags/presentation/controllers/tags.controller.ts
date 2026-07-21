import { Controller, Get } from '@nestjs/common'
import { ListTagsUseCase } from '../../application/use-cases/list-tags.use-case'

@Controller('tags')
export class TagsController {
  constructor(private readonly listTagsUseCase: ListTagsUseCase) {}

  @Get()
  findAll() {
    return this.listTagsUseCase.execute()
  }
}
