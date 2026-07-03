"use client";

import { useState } from "react";
import { Brain, Music, Hand, Eye } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { BrainOverlay } from "@/components/brain-overlay";

interface JuegoData {
  id: string;
  nombre: string;
  lobulo: string;
  lobuloImg: string;
  descripcion: string;
  cartaUrl: string;
  completado: boolean;
}

const lobuloIcons: Record<string, React.ElementType> = {
  frontal: Brain,
  temporal: Music,
  parietal: Hand,
  occipital: Eye,
};

const lobuloColors: Record<string, string> = {
  frontal: "from-red-400 to-red-500 shadow-red-200",
  temporal: "from-green-400 to-green-500 shadow-green-200",
  parietal: "from-blue-400 to-blue-500 shadow-blue-200",
  occipital: "from-yellow-400 to-yellow-500 shadow-yellow-200",
};

const lobuloGlows: Record<string, string> = {
  frontal: "ring-red-300",
  temporal: "ring-green-300",
  parietal: "ring-blue-300",
  occipital: "ring-yellow-300",
};

export function BrainSection({ juegos }: { juegos: JuegoData[] }) {
  const [selectedCarta, setSelectedCarta] = useState<JuegoData | null>(null);
  const completados = juegos.filter((j) => j.completado);

  return (
    <>
      <BrainOverlay juegos={juegos} />

      {completados.length > 0 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {completados.map((juego) => {
            const Icon = lobuloIcons[juego.lobulo] ?? Brain;
            return (
              <button
                key={juego.id}
                onClick={() => setSelectedCarta(juego)}
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lobuloColors[juego.lobulo] ?? "from-gray-400 to-gray-500"} text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 hover:ring-2 ${lobuloGlows[juego.lobulo] ?? "ring-gray-300"} cursor-pointer`}
                title={`Ver ${juego.nombre}`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      )}

      <Dialog.Root
        open={!!selectedCarta}
        onOpenChange={(open) => {
          if (!open) setSelectedCarta(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Popup className="max-w-[85vw] max-h-[85vh] w-auto h-auto bg-transparent shadow-none">
            {selectedCarta && (
              <div className="relative">
                <img
                  src={selectedCarta.cartaUrl}
                  alt={selectedCarta.nombre}
                  className="w-auto h-auto max-w-[85vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                />
                <Dialog.Close className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all text-lg">
                  ✕
                </Dialog.Close>
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
