"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { PHOTOS } from "@/lib/images";

const inputClass =
  "mt-1.5 w-full border border-line bg-paper px-4 py-2.5 outline-none transition focus:border-ink";

export default function ContactPage() {
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
    <>
      <PageHero
        eyebrow="Registre · Assistance"
        title="Nous contacter"
        description="Une question, une demande de retrait, un signalement ou un partenariat ? Écrivez-nous — nous répondons sous 48 heures ouvrées."
        stats={[
          { value: "48 h", label: "délai de réponse" },
          { value: "3", label: "canaux de contact" },
          { value: "Abidjan", label: "ancrage local" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Infos */}
          <div className="space-y-5">
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <img
                  src={PHOTOS.contact}
                  alt="Deux personnes échangeant dans un bureau"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
            {[
              {
                color: "bg-accent",
                label: "Email",
                value: "contact@nevalo.ci",
                desc: "Questions générales, partenariats, presse.",
              },
              {
                color: "bg-gold",
                label: "Signalement",
                value: "Depuis chaque avis",
                desc: "Un bouton de signalement est disponible sur chaque fiche entreprise.",
              },
              {
                color: "bg-blue",
                label: "Entreprises",
                value: "Revendiquer sa fiche",
                desc: "Répondez aux avis et mettez à jour vos informations.",
              },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 80}>
                <div className="flex items-start gap-4 border border-line bg-surface p-5">
                  <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${c.color}`} />
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wide text-muted">
                      {c.label}
                    </p>
                    <p className="mt-1 font-semibold text-ink">{c.value}</p>
                    <p className="mt-0.5 text-sm text-soft">{c.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={240}>
              <div className="border-l-4 border-accent bg-surface p-5">
                <p className="font-semibold text-ink">Horaires</p>
                <p className="mt-1 text-sm text-soft">
                  Du lundi au vendredi, 8 h – 18 h (GMT). Les messages reçus hors
                  de ces horaires sont traités le jour ouvré suivant.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Formulaire */}
          <Reveal delay={100}>
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
                    Merci ! Votre message a bien été envoyé. Nous revenons vers
                    vous rapidement.
                  </p>
                ) : null}
                {error ? (
                  <p className="border border-danger bg-danger/5 px-4 py-2.5 text-sm text-danger">
                    {error}
                  </p>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-ink" htmlFor="name">
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
                    <label className="block text-sm font-semibold text-ink" htmlFor="email">
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
                  <label className="block text-sm font-semibold text-ink" htmlFor="subject">
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
                  <label className="block text-sm font-semibold text-ink" htmlFor="message">
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
          </Reveal>
        </div>

        {/* Mini FAQ */}
        <Reveal>
          <div className="mt-16 border-b-2 border-ink pb-3">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight text-ink">
              Avant de nous écrire
            </h2>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Comment la note est-elle calculée ?", "Consultez la page Méthodologie pour le détail des 9 critères.", "/methode"],
            ["Mon avis est-il anonyme ?", "Oui, vous choisissez votre niveau de visibilité à chaque dépôt.", "/faq"],
            ["Une entreprise peut-elle retirer un avis ?", "Non, elle peut seulement répondre ou signaler un contenu contraire aux règles.", "/faq"],
          ].map(([q, a, href], i) => (
            <Reveal key={q} delay={i * 80}>
              <Link
                href={href}
                className="block h-full border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <p className="font-semibold text-ink">{q}</p>
                <p className="mt-1 text-sm text-soft">{a}</p>
                <p className="mt-3 font-mono text-xs font-semibold text-accent">
                  En savoir plus →
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
