import { NextRequest, NextResponse } from "next/server";
import { isTrustedOrigin } from "../origin-validation";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json(
      { message: "Origem da requisição não permitida" },
      { status: 403 },
    );
  }
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete("emarket-session");
  return response;
}
