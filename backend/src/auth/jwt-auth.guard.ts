import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from './authenticated-request';
import { getJwtSecret } from './jwt.config';
import { JWT_AUDIENCE, JWT_ISSUER } from './jwt.config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Faça login para continuar');
    try {
      request.user = await this.jwt.verifyAsync<AuthenticatedUser>(token, {
        secret: getJwtSecret(),
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithms: ['HS256'],
      });
      const session = await this.prisma.user.findUnique({
        where: { id: request.user.sub },
        select: { isActive: true, sessionVersion: true, role: true },
      });
      if (
        !session?.isActive ||
        session.sessionVersion !== request.user.version
      ) {
        throw new UnauthorizedException();
      }
      request.user.role = session.role;
      return true;
    } catch {
      throw new UnauthorizedException(
        'Sua sessão expirou. Faça login novamente',
      );
    }
  }
}
