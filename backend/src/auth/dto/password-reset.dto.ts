import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail() email: string;
}

export class ResetPasswordDto {
  @IsString() token: string;
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: 'A senha deve conter letra maiúscula, minúscula, número e símbolo',
  })
  password: string;
}
