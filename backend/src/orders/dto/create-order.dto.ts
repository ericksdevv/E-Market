import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaymentMethod, ShippingMethod } from '@prisma/client';

export class CreateOrderDto {
  @IsInt() addressId: number;
  @IsEnum(ShippingMethod) shippingMethod: ShippingMethod;
  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;
  @IsOptional() @IsString() @MaxLength(40) couponCode?: string;
  @IsOptional() @IsString() @MaxLength(300) notes?: string;
}
