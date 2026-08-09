import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { createHash, randomBytes } from 'crypto';

const DUMMY_PASSWORD_HASH =
  '$2b$12$C6UzMDM.H6dfI/f/IKxGhuE8RrV7xT7d5DMJxKxY9VJvYw7n8bKjK';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          cpf: data.cpf,
          addresses: {
            create: {
              street: data.street,
              number: data.number,
              neighborhood: data.neighborhood,
              city: data.city,
              state: data.state,
              zipCode: data.zipCode,
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
      return this.issueSession(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const fields = Array.isArray(error.meta?.target)
          ? error.meta.target
          : [];
        if (fields.includes('phone')) {
          throw new ConflictException(
            'Este número de celular já foi vinculado a outra conta',
          );
        }
        throw new ConflictException('E-mail ou CPF já cadastrado');
      }
      throw error;
    }
  }

  async login(data: LoginDto) {
    if (!data.email && !data.cpf) {
      throw new BadRequestException('Informe seu e-mail ou CPF');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.cpf ? [{ cpf: data.cpf }] : []),
        ],
      },
    });

    const validPassword = await bcrypt.compare(
      data.password,
      user?.password ?? DUMMY_PASSWORD_HASH,
    );
    if (!user || !user.isActive || !validPassword) {
      throw new UnauthorizedException('E-mail, CPF ou senha inválidos');
    }

    return this.issueSession(user);
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const message =
      'Se o e-mail estiver cadastrado, uma opção de recuperação será disponibilizada.';
    if (!user) return { message };
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
    });
    return process.env.NODE_ENV === 'production'
      ? { message }
      : { message, resetToken: token };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const reset = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    if (!reset || reset.usedAt || reset.expiresAt < new Date())
      throw new BadRequestException('Link de recuperação inválido ou expirado');
    const hashedPassword = await bcrypt.hash(password, 12);
    await this.prisma.$transaction(async (tx) => {
      const claim = await tx.passwordResetToken.updateMany({
        where: {
          id: reset.id,
          usedAt: null,
          expiresAt: { gte: new Date() },
        },
        data: { usedAt: new Date() },
      });
      if (claim.count === 0) {
        throw new BadRequestException(
          'Link de recuperação inválido ou expirado',
        );
      }
      await tx.user.update({
        where: { id: reset.userId },
        data: {
          password: hashedPassword,
          sessionVersion: { increment: 1 },
        },
      });
    });
    return { message: 'Senha atualizada com sucesso' };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        theme: true,
        orderUpdates: true,
        marketingEmails: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return { user };
  }

  async updateSettings(userId: number, data: UpdateSettingsDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        theme: true,
        orderUpdates: true,
        marketingEmails: true,
      },
    });
    return { user };
  }

  async updateProfile(userId: number, data: UpdateUserDto) {
    if (data.phone) {
      const phoneOwner = await this.prisma.user.findFirst({
        where: { phone: data.phone, id: { not: userId } },
        select: { id: true },
      });
      if (phoneOwner) {
        throw new ConflictException(
          'Este número de celular já foi vinculado a outra conta',
        );
      }
    }
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

      return { user };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const fields = Array.isArray(error.meta?.target)
          ? error.meta.target
          : [];
        if (fields.includes('phone')) {
          throw new ConflictException(
            'Este número de celular já foi vinculado a outra conta',
          );
        }
        throw new ConflictException('E-mail já cadastrado');
      }
      throw error;
    }
  }

  private issueSession(user: {
    id: number;
    email: string;
    name: string;
    role?: string;
    sessionVersion: number;
  }) {
    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        version: user.sessionVersion,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role ?? 'CLIENT',
      },
    };
  }
}
