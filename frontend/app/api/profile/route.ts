import { NextRequest, NextResponse } from "next/server";
import { isTrustedOrigin } from "../origin-validation";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:3000";

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
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = {
    name: String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    phone: String(form.get("phone") ?? "").trim() || null,
  };

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message)
      ? body.message[0]
      : (body.message ?? "Could not update your account");
    return NextResponse.redirect(
      new URL(`/perfil?erro=${encodeURIComponent(message)}`, request.url),
    );
  }

  return NextResponse.redirect(new URL("/perfil?sucesso=1", request.url));
}
