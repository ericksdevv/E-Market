import { NextRequest, NextResponse } from "next/server";
import { isTrustedOrigin } from "../origin-validation";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:3000";
const digits = (value: FormDataEntryValue | null) =>
  String(value ?? "").replace(/\D/g, "");

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json(
      { message: "Origem da requisição não permitida" },
      { status: 403 },
    );
  }
  const form = await request.formData();
  const mode = form.get("mode") === "register" ? "register" : "login";
  const identifier = String(form.get("identifier") ?? "").trim();
  const payload =
    mode === "register"
      ? {
          name: String(form.get("name") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
          phone: digits(form.get("phone")),
          cpf: digits(form.get("cpf")),
          street: String(form.get("street") ?? "").trim(),
          number: String(form.get("number") ?? "").trim(),
          neighborhood: String(form.get("neighborhood") ?? "").trim(),
          city: String(form.get("city") ?? "").trim(),
          state: String(form.get("state") ?? "").trim(),
          zipCode: digits(form.get("zipCode")),
          password: String(form.get("password") ?? ""),
        }
      : {
          ...(identifier.includes("@")
            ? { email: identifier }
            : { cpf: digits(identifier) }),
          password: String(form.get("password") ?? ""),
        };
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    const page = mode === "register" ? "cadastro" : "login";
    const message = encodeURIComponent("A API do E-Market está indisponível");
    return new NextResponse(null, {
      status: 303,
      headers: { Location: `/${page}?erro=${message}` },
    });
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message)
      ? body.message[0]
      : (body.message ?? "Não foi possível concluir a solicitação");
    return new NextResponse(null, {
      status: 303,
      headers: {
        Location: `/${mode === "register" ? "cadastro" : "login"}?erro=${encodeURIComponent(message)}`,
      },
    });
  }
  const data = (await response.json()) as { access_token: string };
  if (!data.access_token || data.access_token.length > 4096) {
    return NextResponse.json(
      { message: "Resposta de autenticação inválida" },
      { status: 502 },
    );
  }
  const result = new NextResponse(null, {
    status: 303,
    headers: {
      Location: "/login?sucesso=1",
    },
  });
  result.cookies.set("emarket-session", data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  result.cookies.delete("emarket-remembered-email");
  return result;
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json(
      { message: "Origem não permitida" },
      { status: 403 },
    );
  }
  const token = request.cookies.get("emarket-session")?.value;
  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    }).catch(() => undefined);
  }
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: "/login" },
  });
  response.cookies.delete("emarket-session");
  return response;
}
