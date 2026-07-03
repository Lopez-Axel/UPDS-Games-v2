import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const cookieHeader = req.headers.get("cookie") ?? "";
  const userIdMatch = cookieHeader.match(/userId=([^;]+)/);
  const userId = userIdMatch ? decodeURIComponent(userIdMatch[1]) : null;

  const progreso = await prisma.progreso.findFirst({
    where: {
      syncToken: token,
      syncExpiresAt: { gt: new Date() },
      completadoAt: null,
    },
  });

  if (!progreso) {
    return NextResponse.redirect(
      new URL("/?error=token-invalido", req.url)
    );
  }

  const targetUserId = userId ?? progreso.userId;

  await prisma.progreso.update({
    where: { id: progreso.id },
    data: {
      completadoAt: new Date(),
      syncToken: null,
      syncExpiresAt: null,
    },
  });

  const response = NextResponse.redirect(
    new URL("/mi-cerebro", req.url)
  );

  if (!userId) {
    response.cookies.set("userId", targetUserId, {
      path: "/",
      sameSite: "lax",
      maxAge: 86400,
    });
  }

  return response;
}
