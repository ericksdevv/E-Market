import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name!: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Telefone inválido' })
  phone?: string;
}
