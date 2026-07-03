import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import * as QRCode from "qrcode";

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  if (!cookieHeader.includes("admin_token=authenticated")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { userId, juegoId } = await req.json();

  if (!userId || !juegoId) {
    return NextResponse.json(
      { error: "userId y juegoId requeridos" },
      { status: 400 }
    );
  }

  const syncToken = randomUUID();
  const syncExpiresAt = new Date(Date.now() + 3 * 60 * 1000);

  await prisma.progreso.upsert({
    where: { userId_juegoId: { userId, juegoId } },
    update: {
      marcadoAt: new Date(),
      syncToken,
      syncExpiresAt,
    },
    create: {
      userId,
      juegoId,
      marcadoAt: new Date(),
      syncToken,
      syncExpiresAt,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://upds-games-production.up.railway.app";
  const qrUrl = `${baseUrl}/sync/${syncToken}`;
  const qr = await QRCode.toDataURL(qrUrl, { width: 300 });

  return NextResponse.json({ token: syncToken, qr });
}
