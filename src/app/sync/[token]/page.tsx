import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function SyncPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  const progreso = await prisma.progreso.findFirst({
    where: {
      syncToken: token,
      syncExpiresAt: { gt: new Date() },
      completadoAt: null,
    },
  });

  if (!progreso) {
    redirect("/?error=token-invalido");
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

  if (!userId) {
    cookieStore.set("userId", targetUserId, {
      path: "/",
      sameSite: "lax",
      maxAge: 86400,
    });
  }

  redirect("/mi-cerebro");
}
