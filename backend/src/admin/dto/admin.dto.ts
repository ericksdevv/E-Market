import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}

export class UpdateClientStatusDto {
  @IsBoolean()
  isActive!: boolean;
}

export class AdjustStockDto {
  @Type(() => Number)
  @IsInt()
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  reason?: string;
}

export class CreateProductDto {
  @IsString() @MinLength(2) @MaxLength(140) name!: string;
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;
  @Type(() => Number) @IsInt() @Min(1) categoryId!: number;
  @IsOptional() @IsString() @MaxLength(2_000) description?: string;
  @IsOptional() @IsString() @MaxLength(80) brand?: string;
  @IsOptional() @IsString() @MaxLength(40) barcode?: string;
  @IsOptional() @IsString() @MaxLength(30) unit?: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price!: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  promotionalPrice?: number;
  @Type(() => Number) @IsInt() @Min(0) stock!: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(140) name?: string;
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) categoryId?: number;
  @IsOptional() @IsString() @MaxLength(2_000) description?: string;
  @IsOptional() @IsString() @MaxLength(80) brand?: string;
  @IsOptional() @IsString() @MaxLength(40) barcode?: string;
  @IsOptional() @IsString() @MaxLength(30) unit?: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  promotionalPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
