"use client";

import { useState } from "react";

export type CompanyResponse = {
  id: string;
  content: string;
  createdAt: string;
};

export function CompanyResponseForm({
  reviewId,
  onPosted,
}: {
  reviewId: string;
  onPosted: (response: CompanyResponse) => void;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) {
      setError("Écrivez une réponse avant de l'envoyer.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = (await response.json().catch(() => ({}))) as
        | CompanyResponse
        | { error?: string };

      if (!response.ok) {
        setError(
          "error" in data && data.error
            ? data.error
            : "Impossible de publier votre réponse.",
        );
        return;
      }

      onPosted(data as CompanyResponse);
      setContent("");
      setOpen(false);
    } catch {
      setError("Impossible de publier votre réponse.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white"
      >
        Répondre en tant qu&apos;entreprise
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 border border-accent bg-paper p-4"
    >
      <label
        htmlFor={`company-response-${reviewId}`}
        className="font-mono text-xs uppercase tracking-[0.16em] text-muted"
      >
        Réponse officielle de l&apos;entreprise
      </label>
      <textarea
        id={`company-response-${reviewId}`}
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          setError(null);
        }}
        rows={3}
        maxLength={2000}
        placeholder="Répondez à cet avis au nom de votre entreprise..."
        className="mt-2 w-full resize-y border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-accent"
      />
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-xs text-muted">
          {content.length}/2000
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setError(null);
            }}
            className="border border-line px-3 py-2 text-sm font-semibold text-soft transition hover:border-ink hover:text-ink"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Publication..." : "Publier"}
          </button>
        </div>
      </div>
    </form>
  );
}
