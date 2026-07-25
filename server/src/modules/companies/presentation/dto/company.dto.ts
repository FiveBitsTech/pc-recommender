import { IsBoolean, IsObject, IsOptional, IsString, MinLength } from 'class-validator'

export class UpsertCompanyDto {
  @IsString()
  @MinLength(2)
  slug!: string

  @IsString()
  @MinLength(2)
  name!: string

  @IsString()
  @MinLength(8)
  website!: string

  @IsOptional()
  @IsString()
  logoUrl?: string

  @IsOptional()
  @IsBoolean()
  logoDarkBg?: boolean

  @IsOptional()
  @IsString()
  logoBgColor?: string | null

  @IsOptional()
  @IsBoolean()
  active?: boolean

  @IsOptional()
  @IsObject()
  scrapeConfig?: Record<string, unknown>
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string

  @IsOptional()
  @IsString()
  @MinLength(8)
  website?: string

  @IsOptional()
  @IsString()
  logoUrl?: string | null

  @IsOptional()
  @IsBoolean()
  logoDarkBg?: boolean

  @IsOptional()
  @IsString()
  logoBgColor?: string | null

  @IsOptional()
  @IsBoolean()
  active?: boolean

  @IsOptional()
  @IsObject()
  scrapeConfig?: Record<string, unknown>
}
