import { NextRequest, NextResponse } from "next/server";
import { isTrustedOrigin } from "../origin-validation";

const redirectUrl = (_request: NextRequest, path: string) =>
  `http://127.0.0.1:3001${path}`;

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json(
      { message: "Origem da requisição não permitida" },
      { status: 403 },
    );
  }
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: redirectUrl(request, "/login") },
  });
  response.cookies.delete("emarket-session");
  return response;
}
