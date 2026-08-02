import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  const prismaMock = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  const jwtServiceMock = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: PrismaService,
            useValue: prismaMock,
          },
          {
            provide: JwtService,
            useValue: jwtServiceMock,
          },
        ],
      }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('register should hash password and return public user data', async () => {
    jest.mocked(bcrypt.hash).mockResolvedValueOnce(
      'hashed-password',
    );
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      name: 'Erick',
      email: 'erick@example.com',
      createdAt: new Date('2026-08-02T00:00:00.000Z'),
    });

    const result = await service.register({
      name: 'Erick',
      email: 'erick@example.com',
      password: '123456',
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: 'Erick',
          email: 'erick@example.com',
          password: expect.any(String),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
    );
    expect(result).toEqual({
      id: 1,
      name: 'Erick',
      email: 'erick@example.com',
      createdAt: new Date('2026-08-02T00:00:00.000Z'),
    });
  });

  it('register should map duplicate email to ConflictException', async () => {
    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          code: 'P2002',
          clientVersion: '6.19.3',
        },
      ),
    );

    await expect(
      service.register({
        name: 'Erick',
        email: 'erick@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login should return access token for valid credentials', async () => {
    jest.mocked(bcrypt.compare).mockResolvedValueOnce(true);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'erick@example.com',
      password: 'hashed-password',
    });
    jwtServiceMock.sign.mockReturnValue('token');

    const result = await service.login({
      email: 'erick@example.com',
      password: '123456',
    });

    expect(result).toEqual({
      access_token: 'token',
    });
  });

  it('login should reject invalid user', async () => {
    jest.mocked(bcrypt.compare).mockResolvedValueOnce(false);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'erick@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
