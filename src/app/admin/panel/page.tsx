"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Juego {
  id: string;
  nombre: string;
  lobulo: string;
}

interface ProgresoResumen {
  juegoId: string;
  completado: boolean;
}

interface ParticipanteResumen {
  id: string;
  apodo: string;
  completados: number;
  totalJuegos: number;
  progresos: ProgresoResumen[];
}

const lobuloAccents: Record<string, string> = {
  frontal: "bg-red-100 text-red-700 border-red-200",
  temporal: "bg-green-100 text-green-700 border-green-200",
  parietal: "bg-blue-100 text-blue-700 border-blue-200",
  occipital: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function AdminPanelPage() {
  const [busqueda, setBusqueda] = useState("");
  const [participantes, setParticipantes] = useState<ParticipanteResumen[]>([]);
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ParticipanteResumen | null>(null);
  const [marking, setMarking] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{ token: string; qr: string } | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/panel-data")
      .then((r) => {
        if (r.status === 401) throw new Error("no-auth");
        return r.json();
      })
      .then((data) => setJuegos(data.juegos))
      .catch(() => router.push("/admin"));
  }, [router]);

  useEffect(() => {
    fetch("/api/admin/listar-participantes")
      .then((r) => {
        if (r.status === 401) throw new Error("no-auth");
        return r.json();
      })
      .then((data) => setParticipantes(data))
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }, [router]);

  const participantesFiltrados = busqueda.trim()
    ? participantes.filter((p) =>
        p.apodo.toLowerCase().includes(busqueda.toLowerCase())
      )
    : participantes;

  async function handleMarcar(juegoId: string) {
    if (!selectedUser) return;
    setMarking(juegoId);
    setError("");
    setQrData(null);

    const res = await fetch("/api/admin/marcar-completado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser.id, juegoId }),
    });

    if (res.status === 401) {
      router.push("/admin");
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Error al marcar");
      setMarking(null);
      return;
    }

    const data = await res.json();
    setQrData(data);

    setSelectedUser((prev) => {
      if (!prev) return prev;
      const exists = prev.progresos.find((p) => p.juegoId === juegoId);
      const updatedProgresos = exists
        ? prev.progresos.map((p) =>
            p.juegoId === juegoId ? { ...p, completado: true } : p
          )
        : [...prev.progresos, { juegoId, completado: true }];
      return {
        ...prev,
        progresos: updatedProgresos,
        completados: updatedProgresos.filter((p) => p.completado).length,
      };
    });

    setParticipantes((prev) =>
      prev.map((p) =>
        p.id === selectedUser.id
          ? { ...p, completados: p.completados + 1 }
          : p
      )
    );
    setMarking(null);
  }

  function juegoCompletado(juegoId: string) {
    return selectedUser?.progresos.some(
      (p) => p.juegoId === juegoId && p.completado
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
      <div className="max-w-lg mx-auto px-4 pt-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-900">Panel Admin</h1>
            <p className="text-sm text-blue-500 mt-0.5">
              Gestiona el progreso de los participantes
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-blue-400 hover:text-blue-600 underline underline-offset-2"
          >
            Inicio
          </Link>
        </div>

        <div className="rounded-xl bg-white p-1 shadow-sm border border-blue-100 has-[input:focus]:ring-2 has-[input:focus]:ring-blue-200 transition-all">
          <Input
            placeholder="Buscar por apodo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border-0 bg-transparent px-4 py-5 text-sm shadow-none placeholder:text-blue-300 focus-visible:ring-0"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {selectedUser ? (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedUser(null);
                  setQrData(null);
                  setError("");
                }}
                className="text-blue-500 hover:text-blue-700 -ml-2"
              >
                ← Volver
              </Button>
            </div>

            <div className="rounded-2xl bg-white shadow-sm border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
                <h2 className="text-lg font-semibold text-white">
                  {selectedUser.apodo}
                </h2>
                <p className="text-blue-200 text-xs mt-1">
                  {selectedUser.completados} de {selectedUser.totalJuegos} juegos completados
                </p>
              </div>
              <div className="p-5 flex flex-col gap-3">
                {juegos.map((juego) => {
                  const completado = juegoCompletado(juego.id);
                  return (
                    <div
                      key={juego.id}
                      className={`rounded-xl border p-4 flex items-center justify-between transition-all ${
                        completado
                          ? "border-green-200 bg-green-50/60"
                          : "border-gray-100 bg-gray-50/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-8 rounded-full ${
                            completado ? "bg-green-400" : "bg-gray-200"
                          }`}
                        />
                        <div>
                          <p
                            className={`font-semibold text-sm ${
                              completado ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {juego.nombre}
                          </p>
                          {juego.lobulo && (
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                                lobuloAccents[juego.lobulo] ??
                                "bg-gray-100 text-gray-500 border-gray-200"
                              }`}
                            >
                              {juego.lobulo}
                            </span>
                          )}
                        </div>
                      </div>
                      {completado ? (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1.5 rounded-lg">
                          ✅
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleMarcar(juego.id)}
                          disabled={marking === juego.id}
                          className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xs h-8 px-3 shadow-sm transition-all"
                        >
                          {marking === juego.id ? "..." : "Marcar"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {qrData && (
              <div className="rounded-2xl bg-white shadow-sm border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3">
                  <h2 className="text-sm font-semibold text-white">
                    QR de sincronización
                  </h2>
                </div>
                <div className="p-6 flex flex-col items-center gap-4">
                  <div className="rounded-xl bg-white p-3 shadow-inner border border-gray-100">
                    <img
                      src={qrData.qr}
                      alt="QR de sincronización"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-blue-500 text-center leading-relaxed">
                    El participante debe escanear este código QR
                    <br />
                    con su celular para desbloquear el lóbulo
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {loading ? (
              <div className="text-center py-12 text-blue-400 text-sm">
                Cargando participantes...
              </div>
            ) : participantesFiltrados.length === 0 ? (
              <div className="text-center py-12 text-blue-300 text-sm">
                {busqueda.trim()
                  ? "No se encontraron participantes"
                  : "Aún no hay participantes registrados"}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {participantesFiltrados.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl bg-white border border-blue-100 p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          p.completados === p.totalJuegos
                            ? "bg-gradient-to-br from-green-400 to-green-600"
                            : p.completados > 0
                              ? "bg-gradient-to-br from-blue-400 to-blue-600"
                              : "bg-gray-300"
                        }`}
                      >
                        {p.apodo.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {p.apodo}
                        </p>
                        <p className="text-xs text-blue-400">
                          {p.completados}/{p.totalJuegos} juegos
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedUser(p);
                        setQrData(null);
                        setError("");
                      }}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xs h-8 px-4 shadow-sm transition-all"
                    >
                      Ver detalles
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
