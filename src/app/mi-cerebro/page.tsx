import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BrainSection } from "@/components/brain-section";
import { GameCard } from "@/components/game-card";

export const dynamic = "force-dynamic";

const lobuloColors: Record<string, string> = {
  frontal: "from-red-400 to-red-500",
  temporal: "from-green-400 to-green-500",
  parietal: "from-blue-400 to-blue-500",
  occipital: "from-yellow-400 to-yellow-500",
};

export default async function MiCerebroPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      progresos: {
        include: { juego: true },
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  const juegos = user.progresos.map((p) => ({
    id: p.juego.id,
    nombre: p.juego.nombre,
    lobulo: p.juego.lobulo,
    lobuloImg: p.juego.lobuloImg,
    descripcion: p.juego.descripcion,
    cartaUrl: `/carta-${p.juego.lobulo}.png`,
    completado: !!p.completadoAt,
    color: lobuloColors[p.juego.lobulo] ?? "from-green-400 to-green-500",
  }));

  const completados = juegos.filter((j) => j.completado).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
      <div className="max-w-md mx-auto px-4 pt-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-900">
            {user.apodo}
          </h1>
          <p className="text-sm text-blue-500 mt-1">
            {completados} de 4 lóbulos desbloqueados
          </p>
        </div>

        <div className="w-full rounded-2xl bg-white p-6 shadow-sm border border-blue-100">
          <BrainSection juegos={juegos} />
        </div>

        <div className="w-full flex flex-col gap-3">
          {juegos.map((juego) => (
            <GameCard key={juego.id} juego={juego} />
          ))}
        </div>
      </div>
    </div>
  );
}
