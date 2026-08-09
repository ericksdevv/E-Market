import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

type RequestLike = {
  ip?: unknown;
  socket?: { remoteAddress?: unknown };
  body?: { email?: unknown; cpf?: unknown };
  route?: { path?: unknown };
  path?: unknown;
};

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : fallback;
}

@Injectable()
export class SecurityThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const request = req as unknown as RequestLike;
    const ip = safeText(
      request.ip,
      safeText(request.socket?.remoteAddress, 'unknown'),
    );
    const identifier = safeText(request.body?.email ?? request.body?.cpf)
      .trim()
      .toLowerCase()
      .slice(0, 254);
    const route = safeText(
      request.route?.path,
      safeText(request.path, 'request'),
    );
    return Promise.resolve(
      identifier ? `${ip}:${route}:${identifier}` : `${ip}:${route}`,
    );
  }
}
