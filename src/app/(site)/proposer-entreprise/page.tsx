"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-1.5 w-full border border-line bg-paper px-4 py-2.5 outline-none transition focus:border-ink";

export default function ProposerEntreprisePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [city, setCity] = useState("");
  const [size, setSize] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sector, city, size, website, description }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    router.push("/mon-espace");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        Registre · Contribution
      </p>
      <h1 className="mt-2 text-4xl font-extrabold uppercase tracking-tight text-ink">
        Proposer une entreprise
      </h1>
      <p className="mt-2 text-sm text-muted">
        La fiche sera publiée après vérification par la modération.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 border border-line bg-surface p-7">
        {error ? (
          <p className="border border-danger bg-danger/5 px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div>
          <label className="block text-sm font-semibold text-ink" htmlFor="name">
            Nom de l&apos;entreprise *
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink" htmlFor="sector">
            Secteur d&apos;activité
          </label>
          <input
            id="sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="city">
              Ville
            </label>
            <input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="size">
              Taille
            </label>
            <input
              id="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="ex. 50-200 employés"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink" htmlFor="website">
            Site web
          </label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full border border-ink bg-ink px-4 py-3 font-semibold text-paper transition hover:bg-soft disabled:opacity-50"
        >
          {loading ? "Envoi…" : "Proposer l'entreprise"}
        </button>
      </form>
    </div>
  );
}
