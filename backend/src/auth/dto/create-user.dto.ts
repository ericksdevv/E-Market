import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty() @IsString() declare name: string;
  @IsEmail() declare email: string;
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @Matches(/^\d{11}$/, { message: 'Informe um CPF com 11 dígitos' })
  declare cpf: string;
  @IsNotEmpty() @IsString() declare street: string;
  @IsNotEmpty() @IsString() declare number: string;
  @IsNotEmpty() @IsString() declare neighborhood: string;
  @IsNotEmpty() @IsString() declare city: string;
  @Transform(({ value }) =>
    String(value ?? '')
      .trim()
      .toUpperCase(),
  )
  @Matches(/^[A-Z]{2}$/, {
    message: 'Informe a UF com 2 letras, por exemplo CE',
  })
  declare state: string;
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @Matches(/^\d{8}$/, { message: 'Informe um CEP com 8 dígitos' })
  declare zipCode: string;
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: 'A senha deve conter letra maiúscula, minúscula, número e símbolo',
  })
  declare password: string;
}
