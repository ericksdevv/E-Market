import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { CreateUserDto } from './dto/create-user.dto';

describe('AuthController', () => {
  const authServiceMock = { register: jest.fn() };
  const controller = new AuthController(
    authServiceMock as unknown as AuthService,
  );
  const registration: CreateUserDto = {
    name: 'Erick Anderson',
    email: 'erick@example.com',
    phone: '85999999999',
    cpf: '12345678901',
    street: 'Rua Central',
    number: '100',
    neighborhood: 'Centro',
    city: 'Fortaleza',
    state: 'CE',
    zipCode: '60000000',
    password: 'Senha@123',
  };

  beforeEach(() => jest.clearAllMocks());

  it('é criado corretamente', () => expect(controller).toBeDefined());

  it('encaminha o cadastro validado ao serviço', async () => {
    const response = {
      access_token: 'signed-token',
      user: {
        id: 1,
        name: registration.name,
        email: registration.email,
        role: 'CLIENT',
      },
    };
    authServiceMock.register.mockResolvedValue(response);
    await expect(controller.register(registration)).resolves.toEqual(response);
    expect(authServiceMock.register).toHaveBeenCalledWith(registration);
  });
});
