import { Body, Controller, Post } from '@nestjs/common'
import { BuildPCUseCase } from '../../application/use-cases/build-pc.use-case'
import { BuildPCDto } from '../dto/build-pc.dto'

@Controller('builder')
export class BuilderController {
  constructor(private readonly buildPCUseCase: BuildPCUseCase) {}

  @Post()
  build(@Body() dto: BuildPCDto) {
    return this.buildPCUseCase.execute({
      usageType: dto.usageType,
      budget: dto.budget,
      brandPreference: dto.brandPreference ?? null,
    })
  }
}
