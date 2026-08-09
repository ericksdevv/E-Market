import type { NextRequest } from "next/server";

function firstHeaderValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
}

function normalizeLocalHost(value: string) {
  return value.replace(/^localhost$/i, '127.0.0.1');
}

export function isTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ??
    request.headers.get("host");
  const protocol =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ??
    request.nextUrl.protocol.replace(":", "");

  if (!host) {
    return false;
  }

  try {
    const source = new URL(origin);
    const sourceHost = normalizeLocalHost(source.hostname);
    const targetHost = normalizeLocalHost(new URL(`${protocol}://${host}`).hostname);
    return (
      source.protocol === `${protocol}:` &&
      source.port === new URL(`${protocol}://${host}`).port &&
      sourceHost.toLowerCase() === targetHost.toLowerCase()
    );
  } catch {
    return false;
  }
}
