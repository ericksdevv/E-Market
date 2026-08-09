export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  const exampleSecret =
    'substitua-por-um-segredo-aleatorio-com-32-caracteres-ou-mais';

  if (!secret || secret.length < 32 || secret === exampleSecret) {
    throw new Error(
      'JWT_SECRET deve ser um segredo aleatório com pelo menos 32 caracteres',
    );
  }

  return secret;
}

export const JWT_ISSUER = 'e-market-api';
export const JWT_AUDIENCE = 'e-market-web';
