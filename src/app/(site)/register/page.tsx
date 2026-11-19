"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const inputClass =
  "mt-1.5 w-full border border-line bg-paper px-4 py-2.5 outline-none transition focus:border-ink";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [salary, setSalary] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, jobTitle, salary, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    const login = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (login?.error) {
      router.push("/login");
      return;
    }

    router.push("/mon-espace");
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md border border-line bg-surface">
        <div className="border-b border-line p-7">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Registre · Inscription
          </p>
          <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-ink">
            Créer un compte
          </h1>
          <p className="mt-1 text-sm text-muted">
            Rejoignez Nevalo et partagez votre expérience.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-7">
          {error ? (
            <p className="border border-danger bg-danger/5 px-4 py-2.5 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="name">
              Nom affiché
            </label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              maxLength={30}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-muted">
              Ce nom apparaîtra sur vos avis nominatifs.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-ink"
              htmlFor="jobTitle"
            >
              Poste (facultatif)
            </label>
            <input
              id="jobTitle"
              type="text"
              maxLength={80}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ex. Analyste risques"
              className={inputClass}
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-ink"
              htmlFor="salary"
            >
              Rémunération mensuelle (XOF, facultatif)
            </label>
            <input
              id="salary"
              type="number"
              min={0}
              max={100000000}
              inputMode="numeric"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Ex. 450000"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-muted">
              Partagez votre rémunération pour aider les autres candidats à se
              faire un aperçu des salaires pratiqués.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1.5 font-mono text-xs text-muted">
              8 caractères minimum.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-ink bg-ink px-4 py-3 font-semibold text-paper transition hover:bg-soft disabled:opacity-50"
          >
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <div className="border-t border-line p-5 text-center text-sm text-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-accent-deep">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
