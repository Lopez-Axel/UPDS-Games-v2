import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json(
      { valido: false, error: "Token requerido" },
      { status: 400 }
    );
  }

  const progreso = await prisma.progreso.findFirst({
    where: {
      syncToken: token,
      syncExpiresAt: { gt: new Date() },
      completadoAt: null,
    },
    include: { juego: { select: { nombre: true, lobulo: true } } },
  });

  if (!progreso) {
    return NextResponse.json(
      { valido: false, error: "Token inválido o expirado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    valido: true,
    juegoNombre: progreso.juego.nombre,
    lobulo: progreso.juego.lobulo,
  });
}
