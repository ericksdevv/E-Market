import { registerDecorator, ValidationOptions } from 'class-validator';

function isValidCpf(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const cpf = String(value).replace(/\D/g, '');
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (length: number) => {
    const sum = cpf
      .slice(0, length)
      .split('')
      .reduce((total, current, index) => {
        return total + Number(current) * (length + 1 - index);
      }, 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export function IsCpf(options?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isCpf',
      target: target.constructor,
      propertyName,
      options: {
        message: 'Informe um CPF válido',
        ...options,
      },
      validator: {
        validate(value: unknown) {
          return isValidCpf(value);
        },
      },
    });
  };
}
