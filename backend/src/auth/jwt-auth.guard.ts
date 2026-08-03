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

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Faça login para continuar');
    try {
      request.user = await this.jwt.verifyAsync<AuthenticatedUser>(token, {
        secret: getJwtSecret(),
      });
      return true;
    } catch {
      throw new UnauthorizedException(
        'Sua sessão expirou. Faça login novamente',
      );
    }
  }
}
