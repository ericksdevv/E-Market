import type { Request } from 'express';
import type { UserRole } from '@prisma/client';

export type AuthenticatedUser = {
  sub: number;
  email: string;
  name: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
