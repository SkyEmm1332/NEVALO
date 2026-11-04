"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

const inputClass =
  "mt-1.5 w-full border border-line bg-paper px-4 py-2.5 outline-none transition focus:border-ink";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    const session = await getSession();
    const isAdmin =
      session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

    const callbackUrl = new URLSearchParams(window.location.search).get(
      "callbackUrl",
    );
    const safeCallback =
      callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : null;

    router.push(safeCallback ?? (isAdmin ? "/admin" : "/"));
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md border border-line bg-surface">
        <div className="border-b border-line p-7">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Registre · Accès
          </p>
          <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-ink">
            Connexion
          </h1>
          <p className="mt-1 text-sm text-muted">Accédez à votre espace Nevalo.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-7">
          {error ? (
            <p className="border border-danger bg-danger/5 px-4 py-2.5 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-ink bg-ink px-4 py-3 font-semibold text-paper transition hover:bg-soft disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="border-t border-line p-5 text-center text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-semibold text-accent hover:text-accent-deep">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
