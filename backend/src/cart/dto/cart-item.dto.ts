import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  productId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity = 1;
}

export class ChangeCartItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  quantity!: number;
}
