import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class AddressDto {
  @IsOptional() @IsString() @MaxLength(40) label?: string;
  @IsString() @Length(3, 120) street: string;
  @IsString() @Length(1, 20) number: string;
  @IsOptional() @IsString() @MaxLength(80) complement?: string;
  @IsString() @Length(2, 80) neighborhood: string;
  @IsString() @Length(2, 80) city: string;
  @IsString() @Length(2, 2) state: string;
  @IsString() @Length(8, 9) zipCode: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
