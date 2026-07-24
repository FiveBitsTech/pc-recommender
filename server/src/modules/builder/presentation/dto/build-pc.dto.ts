import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class BuildPCDto {
  @IsString()
  usageType!: string

  @IsNumber()
  @Min(1000)
  budget!: number

  @IsOptional()
  @IsString()
  brandPreference?: string
}
