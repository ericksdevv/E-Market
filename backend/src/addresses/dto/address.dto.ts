import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

const trimText = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class AddressDto {
  @IsOptional()
  @Transform(({ value }) => trimText(value))
  @IsString()
  @MaxLength(40)
  label?: string;
  @Transform(({ value }) => trimText(value))
  @IsString()
  @Length(3, 120)
  street: string;
  @Transform(({ value }) => trimText(value))
  @IsString()
  @Length(1, 20)
  number: string;
  @IsOptional()
  @Transform(({ value }) => trimText(value))
  @IsString()
  @MaxLength(80)
  complement?: string;
  @Transform(({ value }) => trimText(value))
  @IsString()
  @Length(2, 80)
  neighborhood: string;
  @Transform(({ value }) => trimText(value))
  @IsString()
  @Length(2, 80)
  city: string;
  @Transform(({ value }) =>
    String(value ?? '')
      .trim()
      .toUpperCase(),
  )
  @IsString()
  @Length(2, 2)
  state: string;
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @IsString()
  @Length(8, 8)
  zipCode: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
