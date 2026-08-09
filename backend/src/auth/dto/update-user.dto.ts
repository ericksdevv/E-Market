import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimText = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateUserDto {
  @IsString()
  @Transform(({ value }) => trimText(value))
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @Transform(({ value }) =>
    String(value ?? '')
      .trim()
      .toLowerCase(),
  )
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @Transform(({ value }) => {
    const phone = String(value ?? '').replace(/\D/g, '');
    return phone || undefined;
  })
  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'Informe um celular válido com DDD' })
  phone?: string;
}
