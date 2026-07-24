import { IsInt, Min } from 'class-validator'

export class CompareProductsDto {
  @IsInt()
  @Min(1)
  productOneId!: number

  @IsInt()
  @Min(1)
  productTwoId!: number
}
