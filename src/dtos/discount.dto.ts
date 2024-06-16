import { IsInt, Min, Max } from 'class-validator';

export class CreateDiscountDto {
  @IsInt()
  @Min(1)
  @Max(100)
  discount: number;
}
