import { NextRequest, NextResponse } from "next/server";
import { isTrustedOrigin } from "../origin-validation";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:3000";
const redirectUrl = (_request: NextRequest, path: string) =>
  `http://127.0.0.1:3001${path}`;

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json(
      { message: "Origem da requisição não permitida" },
      { status: 403 },
    );
  }
  const form = await request.formData();
  const token = request.cookies.get("emarket-session")?.value;

  if (!token) {
    return new NextResponse(null, {
      status: 303,
      headers: { Location: redirectUrl(request, "/login") },
    });
  }

  const payload = {
    name: String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    phone: String(form.get("phone") ?? "").trim() || null,
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    return new NextResponse(null, {
      status: 303,
      headers: {
        Location: redirectUrl(
          request,
          "/perfil?erro=API%20indispon%C3%ADvel",
        ),
      },
    });
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message)
      ? body.message[0]
      : (body.message ?? "Não foi possível atualizar sua conta");
    return new NextResponse(null, {
      status: 303,
      headers: {
        Location: redirectUrl(
          request,
          `/perfil?erro=${encodeURIComponent(message)}`,
        ),
      },
    });
  }

  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: redirectUrl(request, "/perfil?sucesso=1"),
    },
  });
}
