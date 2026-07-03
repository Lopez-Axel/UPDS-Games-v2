import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  if (!cookieHeader.includes("admin_token=authenticated")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const apodo = searchParams.get("apodo");

  if (!apodo) {
    return NextResponse.json(
      { error: "Apodo requerido" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { apodo },
    include: {
      progresos: {
        select: {
          juegoId: true,
          completadoAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Participante no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: user.id,
    apodo: user.apodo,
    progresos: user.progresos.map((p) => ({
      juegoId: p.juegoId,
      completado: !!p.completadoAt,
    })),
  });
}
