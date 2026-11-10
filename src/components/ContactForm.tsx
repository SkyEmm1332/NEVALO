"use client";

import { useState } from "react";

const inputClass =
  "mt-1.5 w-full border border-line bg-paper px-4 py-2.5 outline-none transition focus:border-ink";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setSent(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  }

  return (
    <div className="border border-line bg-surface">
      <div className="border-b border-line p-6">
        <h2 className="text-xl font-extrabold tracking-tight text-ink">
          Envoyer un message
        </h2>
        <p className="mt-1 text-sm text-muted">
          Les champs marqués d&apos;un * sont obligatoires.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 p-6">
        {sent ? (
          <p className="border border-accent bg-accent/5 px-4 py-3 text-sm text-accent">
            Merci ! Votre message a bien été envoyé. Nous revenons vers vous
            rapidement.
          </p>
        ) : null}
        {error ? (
          <p className="border border-danger bg-danger/5 px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="block text-sm font-semibold text-ink"
              htmlFor="name"
            >
              Nom *
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
            <label
              className="block text-sm font-semibold text-ink"
              htmlFor="email"
            >
              Email *
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
        </div>

        <div>
          <label
            className="block text-sm font-semibold text-ink"
            htmlFor="subject"
          >
            Sujet
          </label>
          <input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label
            className="block text-sm font-semibold text-ink"
            htmlFor="message"
          >
            Message *
          </label>
          <textarea
            id="message"
            rows={6}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full border border-ink bg-ink px-6 py-3 font-semibold text-paper transition hover:bg-soft disabled:opacity-50"
        >
          {loading ? "Envoi…" : "Envoyer le message"}
        </button>
      </form>
    </div>
  );
}
