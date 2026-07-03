"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const [apodo, setApodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apodo.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apodo: apodo.trim() }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Error al registrarse");
      setLoading(false);
      return;
    }

    router.push("/mi-cerebro");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="Feria UPDS"
            className="w-40 h-40 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">
            Feria UPDS
          </h1>
          <p className="text-blue-600/70 mt-1.5 text-sm font-medium">
            Explora tu cerebro a través de 4 juegos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="rounded-xl bg-white p-1 shadow-sm border border-blue-100 has-[input:focus]:ring-2 has-[input:focus]:ring-blue-200 has-[input:focus]:border-blue-300 transition-all">
            <Input
              placeholder="Tu apodo"
              value={apodo}
              onChange={(e) => setApodo(e.target.value)}
              maxLength={50}
              required
              className="border-0 bg-transparent px-4 py-6 text-base shadow-none placeholder:text-blue-300 focus-visible:ring-0"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center font-medium">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-medium rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Comenzar"}
          </Button>
        </form>

        <Link
          href="/admin"
          className="text-xs text-blue-400 hover:text-blue-600 transition-colors underline underline-offset-2"
        >
          Acceso administrador
        </Link>
      </div>
    </div>
  );
}
