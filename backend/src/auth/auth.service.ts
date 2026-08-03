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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
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
        select: { id: true, name: true, email: true, role: true },
      });
      return this.issueSession(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
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

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('E-mail, CPF ou senha inválidos');
    }

    return this.issueSession(user);
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return { user };
  }

  async updateProfile(userId: number, data: UpdateUserDto) {
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
          cpf: true,
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
        throw new ConflictException('E-mail já cadastrado');
      }
      throw error;
    }
  }

  private issueSession(user: { id: number; email: string; name: string; role?: string }) {
    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }),
      user: { id: user.id, name: user.name, email: user.email, role: user.role ?? 'CLIENT' },
    };
  }
}
