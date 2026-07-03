"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface ScanResult {
  exito: boolean;
  juegoNombre: string;
  lobulo: string;
  error?: string;
}

interface QrScannerProps {
  onResult: (result: ScanResult) => void;
}

export default function QrScanner({ onResult }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraError, setCameraError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const elId = "qr-reader-" + Math.random().toString(36).slice(2, 9);

    if (containerRef.current) {
      containerRef.current.id = elId;
    }

    async function start() {
      try {
        const scanner = new Html5Qrcode(elId);
        scannerRef.current = scanner;
        setScanning(true);

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (doneRef.current || cancelled) return;
            doneRef.current = true;

            await scanner.stop();
            setScanning(false);

            const match = decodedText.match(/\/sync\/([a-zA-Z0-9-]+)/);
            if (!match) {
              onResult({
                exito: false,
                juegoNombre: "",
                lobulo: "",
                error: "QR no reconocido. Escaneá el código del panel admin.",
              });
              return;
            }

            const token = match[1];

            try {
              const res = await fetch("/api/scanner/validar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
              });

              const data = await res.json();

              if (!res.ok || !data.valido) {
                onResult({
                  exito: false,
                  juegoNombre: "",
                  lobulo: "",
                  error: data.error ?? "Token inválido o expirado",
                });
                return;
              }

              const completeRes = await fetch("/api/scanner/completar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
              });

              if (!completeRes.ok) {
                onResult({
                  exito: false,
                  juegoNombre: "",
                  lobulo: "",
                  error: "Error al completar el desbloqueo",
                });
                return;
              }

              onResult({
                exito: true,
                juegoNombre: data.juegoNombre,
                lobulo: data.lobulo,
              });
            } catch {
              if (!cancelled) {
                onResult({
                  exito: false,
                  juegoNombre: "",
                  lobulo: "",
                  error: "Error de conexión. Intentá de nuevo.",
                });
              }
            }
          },
          () => {}
        );
      } catch {
        if (!cancelled) setCameraError(true);
      }
    }

    start();

    return () => {
      cancelled = true;
      doneRef.current = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [onResult]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100"
      />
      {cameraError && (
        <p className="text-sm text-red-500 text-center">
          No se pudo acceder a la cámara.
          <br />
          Asegurate de haber permitido el acceso.
        </p>
      )}
      {scanning && !cameraError && (
        <p className="text-sm text-blue-500 text-center animate-pulse">
          Apuntá al código QR del panel admin
        </p>
      )}
    </div>
  );
}
