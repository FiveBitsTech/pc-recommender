import { IsBoolean, IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator'
import { Type } from 'class-transformer'

export class RunScrapingDto {
  @ValidateIf((o) => o.companyId == null)
  @IsOptional()
  @IsString()
  source?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean
}

export class PreviewScrapingDto {
  @IsString()
  source!: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number
}
