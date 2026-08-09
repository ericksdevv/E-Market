export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET deve conter pelo menos 32 caracteres');
  }

  return secret;
}

export const JWT_ISSUER = 'e-market-api';
export const JWT_AUDIENCE = 'e-market-web';
