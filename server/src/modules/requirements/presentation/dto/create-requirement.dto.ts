import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateRequirementDto {
  @IsString()
  usageType!: string

  @IsNumber()
  @Min(0)
  budget!: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number

  @IsString()
  priority!: string

  @IsString()
  deviceType!: string

  @IsOptional()
  @IsString()
  brandPreference?: string
}
