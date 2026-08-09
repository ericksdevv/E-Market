import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import type { CreateUserDto } from './dto/create-user.dto';

jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));
import * as bcrypt from 'bcrypt';

const hashMock = bcrypt.hash as unknown as jest.MockedFunction<
  (value: string, rounds: number) => Promise<string>
>;
const compareMock = bcrypt.compare as unknown as jest.MockedFunction<
  (value: string, encrypted: string) => Promise<boolean>
>;

describe('AuthService', () => {
  let service: AuthService;
  const prismaMock = { user: { create: jest.fn(), findFirst: jest.fn() } };
  const jwtServiceMock = { sign: jest.fn() };
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('é criado pelo módulo', () => expect(service).toBeDefined());

  it('gera hash da senha e retorna apenas os dados públicos', async () => {
    hashMock.mockResolvedValueOnce('hashed-password');
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      name: registration.name,
      email: registration.email,
      role: UserRole.CLIENT,
      sessionVersion: 0,
    });
    jwtServiceMock.sign.mockReturnValue('signed-token');

    const result = await service.register(registration);

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        cpf: registration.cpf,
        password: 'hashed-password',
        addresses: {
          create: {
            street: registration.street,
            number: registration.number,
            neighborhood: registration.neighborhood,
            city: registration.city,
            state: registration.state,
            zipCode: registration.zipCode,
            isDefault: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        sessionVersion: true,
      },
    });
    expect(result).toEqual({
      access_token: 'signed-token',
      user: {
        id: 1,
        name: registration.name,
        email: registration.email,
        role: UserRole.CLIENT,
      },
    });
  });

  it('converte conflito de dados únicos em resposta de conflito', async () => {
    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.3',
      }),
    );
    await expect(service.register(registration)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('emite uma sessão para credenciais válidas', async () => {
    compareMock.mockResolvedValueOnce(true);
    prismaMock.user.findFirst.mockResolvedValue({
      id: 1,
      name: registration.name,
      email: registration.email,
      password: 'hashed-password',
      role: UserRole.CLIENT,
      isActive: true,
      sessionVersion: 0,
    });
    jwtServiceMock.sign.mockReturnValue('signed-token');

    await expect(
      service.login({
        email: registration.email,
        password: registration.password,
      }),
    ).resolves.toEqual({
      access_token: 'signed-token',
      user: {
        id: 1,
        name: registration.name,
        email: registration.email,
        role: UserRole.CLIENT,
      },
    });
  });

  it('rejeita credenciais inválidas sem revelar qual campo falhou', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    await expect(
      service.login({
        email: registration.email,
        password: registration.password,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
