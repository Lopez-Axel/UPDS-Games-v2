"use client";

import { useState } from "react";
import Image from "next/image";
import { Brain, Music, Hand, Eye } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

interface JuegoInfo {
  id: string;
  nombre: string;
  lobulo: string;
  lobuloImg: string;
  descripcion: string;
  completado: boolean;
}

interface BrainOverlayProps {
  juegos: JuegoInfo[];
}

const ANCHO = 1086;
const ALTO = 996;
const RADIO_PX = 45;

const lobuloCoords: Record<string, { x: number; y: number }> = {
  frontal: { x: 280, y: 280 },
  occipital: { x: 970, y: 470 },
  parietal: { x: 760, y: 180 },
  temporal: { x: 540, y: 525 },
};

const lobuloIcons: Record<string, React.ElementType> = {
  frontal: Brain,
  temporal: Music,
  parietal: Hand,
  occipital: Eye,
};

const lobuloColors: Record<string, string> = {
  frontal: "from-red-400 to-red-500",
  temporal: "from-green-400 to-green-500",
  parietal: "from-blue-400 to-blue-500",
  occipital: "from-yellow-400 to-yellow-500",
};

export function BrainOverlay({ juegos }: BrainOverlayProps) {
  const [selectedCarta, setSelectedCarta] = useState<JuegoInfo | null>(null);
  const completados = juegos.filter((j) => j.completado);

  return (
    <>
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: `${ANCHO}/${ALTO}` }}
      >
        <Image
          src="/cerebro-gris.png"
          alt="Cerebro"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 400px"
          priority
        />
        {juegos
          .filter((j) => j.completado)
          .map((juego) => (
            <img
              key={juego.id}
              src={juego.lobuloImg}
              alt={`Lóbulo ${juego.lobulo}`}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          ))}
        {completados.map((juego) => {
          const coord = lobuloCoords[juego.lobulo];
          if (!coord) return null;
          const Icon = lobuloIcons[juego.lobulo] ?? Brain;
          const leftPct = (coord.x / ANCHO) * 100;
          const topPct = (coord.y / ALTO) * 100;
          const diameterPct = ((RADIO_PX * 2) / ANCHO) * 100;
          return (
            <button
              key={juego.id}
              onClick={() => setSelectedCarta(juego)}
              className={`absolute bg-gradient-to-br ${lobuloColors[juego.lobulo] ?? "from-gray-400 to-gray-500"} text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer rounded-full`}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${diameterPct}%`,
                aspectRatio: "1/1",
                transform: "translate(-50%, -50%)",
              }}
              title={`Ver ${juego.nombre}`}
            >
              <Icon className="w-1/2 h-1/2" />
            </button>
          );
        })}
      </div>

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
                  src={`/carta-${selectedCarta.lobulo}.png`}
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
