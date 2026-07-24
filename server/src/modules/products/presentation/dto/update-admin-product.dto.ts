import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator'

class ProductSpecsDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  processor?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(255)
  gpu?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ram?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(100)
  storage?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(100)
  screen?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(100)
  operatingSystem?: string | null
}

export class UpdateAdminProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  productUrl?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  imageUrl?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(100)
  externalSku?: string | null

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductSpecsDto)
  specs?: ProductSpecsDto
}

export class ListAdminProductsQueryDto {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number
}
