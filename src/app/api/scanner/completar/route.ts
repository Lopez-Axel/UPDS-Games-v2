import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json(
      { error: "Token requerido" },
      { status: 400 }
    );
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  const userIdMatch = cookieHeader.match(/userId=([^;]+)/);
  const cookieUserId = userIdMatch ? decodeURIComponent(userIdMatch[1]) : null;

  const progreso = await prisma.progreso.findFirst({
    where: {
      syncToken: token,
      syncExpiresAt: { gt: new Date() },
      completadoAt: null,
    },
  });

  if (!progreso) {
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 404 }
    );
  }

  const targetUserId = cookieUserId ?? progreso.userId;

  await prisma.progreso.update({
    where: { id: progreso.id },
    data: {
      completadoAt: new Date(),
      syncToken: null,
      syncExpiresAt: null,
    },
  });

  const response = NextResponse.json({ exito: true });

  if (!cookieUserId) {
    response.cookies.set("userId", targetUserId, {
      path: "/",
      sameSite: "lax",
      maxAge: 86400,
    });
  }

  return response;
}
