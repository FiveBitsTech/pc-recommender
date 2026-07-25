import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator'

export class GenerateScrapeConfigDto {
  @IsString()
  @MinLength(2)
  name!: string

  @IsString()
  @MinLength(8)
  website!: string

  @IsOptional()
  @IsBoolean()
  probe?: boolean
}
