import type { NextRequest } from "next/server";

function firstHeaderValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
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
    return (
      source.protocol === `${protocol}:` &&
      source.host.toLowerCase() === host.toLowerCase()
    );
  } catch {
    return false;
  }
}
