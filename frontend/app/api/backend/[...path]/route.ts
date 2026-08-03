import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isTrustedOrigin } from "../../origin-validation";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:3000";
const ALLOWED_ROOTS = new Set([
  "auth",
  "products",
  "cart",
  "favorites",
  "addresses",
  "orders",
  "coupons",
  "admin",
]);
const BODY_LIMIT = 64 * 1024;

async function forward(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (
    !path.length ||
    !ALLOWED_ROOTS.has(path[0]) ||
    path.some((part) => part === ".." || part.includes("/"))
  ) {
    return NextResponse.json(
      { message: "Rota não permitida" },
      { status: 404 },
    );
  }
  if (!["GET", "HEAD"].includes(request.method) && !isTrustedOrigin(request)) {
    return NextResponse.json(
      { message: "Origem da requisição não permitida" },
      { status: 403 },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > BODY_LIMIT)
    return NextResponse.json(
      { message: "Requisição muito grande" },
      { status: 413 },
    );

  const token = (await cookies()).get("emarket-session")?.value;
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.text();
  if (body && new TextEncoder().encode(body).length > BODY_LIMIT) {
    return NextResponse.json(
      { message: "Requisição muito grande" },
      { status: 413 },
    );
  }

  try {
    const target = `${API_URL}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
    const response = await fetch(target, {
      method: request.method,
      headers: {
        "Content-Type":
          request.headers.get("content-type") ?? "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body || undefined,
      cache: "no-store",
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "A API do E-Market está indisponível" },
      { status: 503 },
    );
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;
