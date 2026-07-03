import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { apodo } = await req.json();

  if (!apodo || typeof apodo !== "string" || !apodo.trim()) {
    return NextResponse.json({ error: "Apodo requerido" }, { status: 400 });
  }

  const trimmed = apodo.trim().slice(0, 50);

  const existing = await prisma.user.findUnique({
    where: { apodo: trimmed },
  });

  if (existing) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("userId", existing.id, {
      path: "/",
      sameSite: "lax",
      maxAge: 86400,
    });
    return response;
  }

  const user = await prisma.user.create({
    data: { apodo: trimmed },
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set("userId", user.id, {
    path: "/",
    sameSite: "lax",
    maxAge: 86400,
  });

  return response;
}
