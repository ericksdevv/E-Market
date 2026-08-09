import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, MaxLength, MinLength } from 'class-validator';
import { IsCpf } from '../cpf.validator';

export class LoginDto {
  @IsOptional()
  @Transform(({ value }) =>
    String(value ?? '')
      .trim()
      .toLowerCase(),
  )
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  declare email?: string;
  @IsOptional()
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @IsCpf()
  declare cpf?: string;
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @MaxLength(64, { message: 'A senha deve ter no máximo 64 caracteres' })
  declare password: string;
}
