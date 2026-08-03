import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @IsOptional() @IsEmail({}, { message: 'Informe um e-mail válido' }) declare email?: string;
  @IsOptional() @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @Matches(/^\d{11}$/, { message: 'Informe um CPF com 11 dígitos' }) declare cpf?: string;
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' }) declare password: string;
}
