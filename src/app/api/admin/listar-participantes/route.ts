import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  if (!cookieHeader.includes("admin_token=authenticated")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    include: {
      progresos: {
        select: {
          juegoId: true,
          completadoAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      apodo: u.apodo,
      completados: u.progresos.filter((p) => p.completadoAt).length,
      totalJuegos: 4,
      progresos: u.progresos.map((p) => ({
        juegoId: p.juegoId,
        completado: !!p.completadoAt,
      })),
    }))
  );
}
