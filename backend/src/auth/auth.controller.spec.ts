import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: authServiceMock,
          },
        ],
      }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should forward register payload to AuthService', async () => {
    authServiceMock.register.mockResolvedValue({
      id: 1,
      name: 'Erick',
      email: 'erick@example.com',
      createdAt: new Date('2026-08-02T00:00:00.000Z'),
    });

    const result = await controller.register({
      name: 'Erick',
      email: 'erick@example.com',
      password: '123456',
    });

    expect(authServiceMock.register).toHaveBeenCalledWith({
      name: 'Erick',
      email: 'erick@example.com',
      password: '123456',
    });
    expect(result).toEqual({
      id: 1,
      name: 'Erick',
      email: 'erick@example.com',
      createdAt: new Date('2026-08-02T00:00:00.000Z'),
    });
  });
});
