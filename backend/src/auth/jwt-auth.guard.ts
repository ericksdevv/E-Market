import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Faça login para continuar');
    try {
      request.user = await this.jwt.verifyAsync(token, { secret: process.env.JWT_SECRET ?? 'dev-only-change-me' });
      return true;
    } catch {
      throw new UnauthorizedException('Sua sessão expirou. Faça login novamente');
    }
  }
}
