import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const adminUser = process.env.ADMIN_USER ?? "admin";
  const adminPass = process.env.ADMIN_PASSWORD ?? "contraUPDS2026";

  if (username !== adminUser || password !== adminPass) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", "authenticated", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 3600,
  });

  return response;
}
