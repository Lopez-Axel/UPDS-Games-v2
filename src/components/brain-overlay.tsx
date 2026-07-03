"use client";

interface JuegoInfo {
  id: string;
  nombre: string;
  lobulo: string;
  lobuloImg: string;
  descripcion: string;
  completado: boolean;
}

export function BrainOverlay({ juegos }: { juegos: JuegoInfo[] }) {
  return (
    <div className="relative w-64 h-64 mx-auto">
      <img
        src="/cerebro-gris.png"
        alt="Cerebro"
        className="absolute inset-0 w-full h-full object-contain"
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
    </div>
  );
}
