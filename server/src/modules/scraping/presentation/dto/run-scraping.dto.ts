import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

const SOURCES = [
  'fixture',
  'memory-kings',
  'live',
  'cyccomputer',
  'impacto',
  'deltron',
] as const

export class RunScrapingDto {
  @IsOptional()
  @IsString()
  @IsIn([...SOURCES])
  source?: string

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean
}

export class PreviewScrapingDto {
  @IsString()
  @IsIn([...SOURCES])
  source!: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number
}
