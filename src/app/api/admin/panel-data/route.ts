import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  if (!cookieHeader.includes("admin_token=authenticated")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const juegos = await prisma.juego.findMany({
    select: { id: true, nombre: true, lobulo: true },
  });

  return NextResponse.json({ juegos });
}
