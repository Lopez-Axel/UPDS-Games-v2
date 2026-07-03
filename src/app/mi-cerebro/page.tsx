import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BrainOverlay } from "@/components/brain-overlay";

export const dynamic = "force-dynamic";

const lobuloLabels: Record<string, string> = {
  frontal: "Frontal",
  temporal: "Temporal",
  parietal: "Parietal",
  occipital: "Occipital",
};

const lobuloColors: Record<string, string> = {
  frontal: "from-red-400 to-red-500",
  temporal: "from-green-400 to-green-500",
  parietal: "from-blue-400 to-blue-500",
  occipital: "from-yellow-400 to-yellow-500",
};

const lobuloBorders: Record<string, string> = {
  frontal: "border-red-300 bg-red-50",
  temporal: "border-green-300 bg-green-50",
  parietal: "border-blue-300 bg-blue-50",
  occipital: "border-yellow-300 bg-yellow-50",
};

const lobuloBadges: Record<string, string> = {
  frontal: "bg-red-100 text-red-700",
  temporal: "bg-green-100 text-green-700",
  parietal: "bg-blue-100 text-blue-700",
  occipital: "bg-yellow-100 text-yellow-700",
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
    pdfUrl: p.juego.pdfUrl,
    completado: !!p.completadoAt,
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
          <BrainOverlay juegos={juegos} />
        </div>

        <div className="w-full flex flex-col gap-3">
          {juegos.map((juego) => (
            <div
              key={juego.id}
              className={`rounded-xl border-2 p-4 transition-all ${
                juego.completado
                  ? lobuloBorders[juego.lobulo] ?? "border-green-300 bg-green-50"
                  : "border-gray-100 bg-white/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`shrink-0 w-1.5 h-10 rounded-full ${
                    juego.completado
                      ? `bg-gradient-to-b ${lobuloColors[juego.lobulo] ?? "from-green-400 to-green-500"}`
                      : "bg-gray-200"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${
                      juego.completado ? "text-gray-900" : "text-gray-400"
                    }`}>
                      {juego.nombre}
                    </p>
                    {juego.completado && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        lobuloBadges[juego.lobulo] ?? "bg-green-100 text-green-700"
                      }`}>
                        {lobuloLabels[juego.lobulo] ?? juego.lobulo}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${
                    juego.completado ? "text-gray-500" : "text-gray-300"
                  }`}>
                    {juego.descripcion}
                  </p>
                </div>
                {juego.completado ? (
                  <a
                    href={juego.pdfUrl}
                    download
                    className="shrink-0 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    PDF
                  </a>
                ) : (
                  <span className="shrink-0 text-[10px] font-medium text-gray-300 bg-gray-50 px-2 py-1 rounded-full">
                    🔒
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
