import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  MinLength,
} from 'class-validator';
import { IsCpf } from '../cpf.validator';

const trimText = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateUserDto {
  @Transform(({ value }) => trimText(value))
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  declare name: string;
  @Transform(({ value }) =>
    String(value ?? '')
      .trim()
      .toLowerCase(),
  )
  @IsEmail()
  @MaxLength(254)
  declare email: string;
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @Matches(/^\d{10,11}$/, {
    message: 'Informe um celular com DDD',
  })
  declare phone: string;
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @IsCpf()
  declare cpf: string;
  @Transform(({ value }) => trimText(value))
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  declare street: string;
  @Transform(({ value }) => trimText(value))
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  declare number: string;
  @Transform(({ value }) => trimText(value))
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  declare neighborhood: string;
  @Transform(({ value }) => trimText(value))
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  declare city: string;
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
  @MaxLength(64, { message: 'A senha deve ter no máximo 64 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: 'A senha deve conter letra maiúscula, minúscula, número e símbolo',
  })
  declare password: string;
}
