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
