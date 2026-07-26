import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt } from 'class-validator'

export class CompareProductsDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(3)
  @IsInt({ each: true })
  productIds!: number[]
}
