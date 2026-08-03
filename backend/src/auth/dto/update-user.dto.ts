import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name!: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
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
