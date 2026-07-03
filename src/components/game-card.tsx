"use client";

import { Brain, Music, Hand, Eye, Lock, Sparkles } from "lucide-react";

interface JuegoData {
  id: string;
  nombre: string;
  lobulo: string;
  lobuloImg: string;
  descripcion: string;
  completado: boolean;
  color: string;
}

const lobuloLabels: Record<string, string> = {
  frontal: "Frontal",
  temporal: "Temporal",
  parietal: "Parietal",
  occipital: "Occipital",
};

const lobuloIcons: Record<string, React.ElementType> = {
  frontal: Brain,
  temporal: Music,
  parietal: Hand,
  occipital: Eye,
};

const lobuloBadges: Record<string, string> = {
  frontal: "bg-red-100 text-red-700",
  temporal: "bg-green-100 text-green-700",
  parietal: "bg-blue-100 text-blue-700",
  occipital: "bg-yellow-100 text-yellow-700",
};

const lobuloIconColors: Record<string, string> = {
  frontal: "text-red-500",
  temporal: "text-green-500",
  parietal: "text-blue-500",
  occipital: "text-yellow-500",
};

export function GameCard({ juego }: { juego: JuegoData }) {
  if (!juego.completado) {
    return (
      <div className="rounded-xl border-2 border-gray-100 bg-white/60 p-4 opacity-50">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-400">
              {juego.nombre}
            </p>
            <p className="text-xs text-gray-300 mt-0.5">
              {juego.descripcion}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = lobuloIcons[juego.lobulo] ?? Sparkles;

  return (
    <div className="rounded-xl border-2 bg-gradient-to-br shadow-sm animate-fade-in-up overflow-hidden"
      style={{
        borderColor: juego.lobulo === "frontal" ? "#fecaca" :
                     juego.lobulo === "temporal" ? "#bbf7d0" :
                     juego.lobulo === "parietal" ? "#bfdbfe" :
                     juego.lobulo === "occipital" ? "#fef08a" : "#e5e7eb",
        background: juego.lobulo === "frontal" ? "linear-gradient(135deg, #fef2f2, #ffffff)" :
                    juego.lobulo === "temporal" ? "linear-gradient(135deg, #f0fdf4, #ffffff)" :
                    juego.lobulo === "parietal" ? "linear-gradient(135deg, #eff6ff, #ffffff)" :
                    juego.lobulo === "occipital" ? "linear-gradient(135deg, #fefce8, #ffffff)" :
                    "linear-gradient(135deg, #f9fafb, #ffffff)",
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: juego.lobulo === "frontal" ? "linear-gradient(135deg, #f87171, #ef4444)" :
                          juego.lobulo === "temporal" ? "linear-gradient(135deg, #4ade80, #22c55e)" :
                          juego.lobulo === "parietal" ? "linear-gradient(135deg, #60a5fa, #3b82f6)" :
                          juego.lobulo === "occipital" ? "linear-gradient(135deg, #facc15, #eab308)" :
                          "linear-gradient(135deg, #9ca3af, #6b7280)",
            }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-gray-900">
                {juego.nombre}
              </p>
              <span className={"text-[10px] font-medium px-1.5 py-0.5 rounded-full " + (lobuloBadges[juego.lobulo] ?? "bg-gray-100 text-gray-500")}>
                {lobuloLabels[juego.lobulo] ?? juego.lobulo}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {juego.descripcion}
            </p>
          </div>
          <Sparkles className={"w-4 h-4 shrink-0 " + (lobuloIconColors[juego.lobulo] ?? "text-green-400")} />
        </div>
      </div>
    </div>
  );
}
