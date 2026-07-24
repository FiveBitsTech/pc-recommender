import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class RunScrapingDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId!: number

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean
}

export class ClearScrapingCatalogDto {
  @IsOptional()
  @IsBoolean()
  clearProducts?: boolean

  @IsOptional()
  @IsBoolean()
  clearHistory?: boolean
}
