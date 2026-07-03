"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Credenciales inválidas");
      setLoading(false);
      return;
    }

    router.push("/admin/panel");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-xl font-bold text-white">🔐</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-900">
            Administrador
          </h1>
          <p className="text-blue-600/70 mt-1 text-sm">
            Ingresa tus credenciales
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="rounded-xl bg-white p-1 shadow-sm border border-blue-100 has-[input:focus]:ring-2 has-[input:focus]:ring-blue-200 transition-all">
            <Input
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border-0 bg-transparent px-4 py-5 text-sm shadow-none placeholder:text-blue-300 focus-visible:ring-0"
            />
          </div>
          <div className="rounded-xl bg-white p-1 shadow-sm border border-blue-100 has-[input:focus]:ring-2 has-[input:focus]:ring-blue-200 transition-all">
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-0 bg-transparent px-4 py-5 text-sm shadow-none placeholder:text-blue-300 focus-visible:ring-0"
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
            className="w-full h-11 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <Link
          href="/"
          className="text-xs text-blue-400 hover:text-blue-600 transition-colors underline underline-offset-2"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
