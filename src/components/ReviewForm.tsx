"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CRITERIA } from "@/lib/rating";
import type { Criterion } from "@prisma/client";

type CompanyOption = { id: string; name: string };

const CONTRACT_TYPES = [
  "CDI",
  "CDD",
  "Stage",
  "Alternance",
  "Freelance / Prestation",
  "Intérim",
  "Autre",
];

const inputClass =
  "mt-1.5 w-full border border-line bg-paper px-4 py-2.5 text-ink outline-none transition placeholder:text-muted focus:border-ink";
const sectionClass = "border border-line bg-surface p-6";

function SectionTitle({
  n,
  children,
}: {
  n: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className="border-b border-line pb-3 text-lg font-extrabold uppercase tracking-tight text-ink">
      <span className="mr-2 font-mono text-accent">{n}</span>
      {children}
    </h2>
  );
}

export function ReviewForm({ companies }: { companies: CompanyOption[] }) {
  const router = useRouter();
  const [companyId, setCompanyId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [contractType, setContractType] = useState(CONTRACT_TYPES[0]);
  const [location, setLocation] = useState("");
  const [isCurrent, setIsCurrent] = useState(true);
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [ratings, setRatings] = useState<Record<Criterion, number>>({
    AMBIANCE: 3,
    MANAGEMENT: 3,
    REMUNERATION: 3,
    EVOLUTION: 3,
    WORKLOAD: 3,
    WORK_LIFE_BALANCE: 3,
    RECOGNITION: 3,
    WORK_CONDITIONS: 3,
    STABILITY: 3,
  });
  const [positives, setPositives] = useState("");
  const [negatives, setNegatives] = useState("");
  const [comment, setComment] = useState("");
  const [visibility, setVisibility] = useState<
    "ANONYMOUS" | "PSEUDONYM" | "NOMINATIVE"
  >("ANONYMOUS");
  const [amount, setAmount] = useState("");
  const [isNet, setIsNet] = useState(true);
  const [period, setPeriod] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        jobTitle,
        contractType,
        location,
        isCurrent,
        recommend,
        ratings,
        positives,
        negatives,
        comment,
        visibility,
        salary:
          amount && !Number.isNaN(Number(amount))
            ? { amount: Number(amount), isNet, period }
            : null,
      }),
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
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <p className="border border-danger bg-danger/5 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <section className={sectionClass}>
        <SectionTitle n="01">Entreprise et poste</SectionTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="company">
              Entreprise *
            </label>
            <select
              id="company"
              required
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className={inputClass}
            >
              <option value="">Choisir une entreprise</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="jobTitle">
              Poste occupé *
            </label>
            <input
              id="jobTitle"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="contract">
              Type de contrat
            </label>
            <select
              id="contract"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              className={inputClass}
            >
              {CONTRACT_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="location">
              Ville du poste
            </label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="ex. Abidjan"
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-soft sm:col-span-2">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="h-4 w-4 border-line text-accent"
            />
            J&apos;y travaille actuellement
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle n="02">Recommandation</SectionTitle>
        <p className="mt-2 text-sm text-muted">
          Recommanderiez-vous cette entreprise à un proche ?
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {(
            [
              [true, "Oui, je la recommande"],
              [false, "Non, je ne la recommande pas"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={String(value)}
              className={`flex cursor-pointer items-center gap-2 border px-5 py-2.5 text-sm font-medium transition ${
                recommend === value
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-line text-soft hover:border-line-strong"
              }`}
            >
              <input
                type="radio"
                name="recommend"
                checked={recommend === value}
                onChange={() => setRecommend(value)}
                className="text-accent"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle n="03">Votre évaluation</SectionTitle>
        <p className="mt-2 text-sm text-muted">Notez de 1 à 5 chaque critère.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CRITERIA.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <label className="text-sm text-soft">{label}</label>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRatings((r) => ({ ...r, [key]: n }))}
                    className={`text-lg leading-none transition ${
                      n <= ratings[key] ? "text-gold" : "text-ink/15"
                    }`}
                    aria-label={`${n} sur 5`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle n="04">Votre témoignage</SectionTitle>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="positives">
              Points positifs
            </label>
            <textarea
              id="positives"
              rows={3}
              value={positives}
              onChange={(e) => setPositives(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="negatives">
              Points négatifs
            </label>
            <textarea
              id="negatives"
              rows={3}
              value={negatives}
              onChange={(e) => setNegatives(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="comment">
              Appréciation générale (facultatif)
            </label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle n="05">Visibilité de votre avis</SectionTitle>
        <div className="mt-4 space-y-2.5">
          {(
            [
              ["ANONYMOUS", "Anonyme", "Aucune identité publique affichée."],
              ["PSEUDONYM", "Pseudonyme", "Un nom d'affichage choisi est visible."],
              ["NOMINATIVE", "Nominatif", "Votre identité est affichée."],
            ] as const
          ).map(([value, label, desc]) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                visibility === value
                  ? "border-accent bg-accent/5"
                  : "border-line hover:border-line-strong"
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value={value}
                checked={visibility === value}
                onChange={() => setVisibility(value)}
                className="mt-0.5 text-accent"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">{label}</span>
                <span className="block text-xs text-muted">{desc}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle n="06">Rémunération</SectionTitle>
        <p className="mt-2 text-xs text-muted">
          Facultatif · le montant déclaré apparaîtra sur la fiche de
          l&apos;entreprise, avec la mention net ou brut.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="amount">
              Montant (XOF)
            </label>
            <input
              id="amount"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="period">
              Périodicité
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as "MONTHLY" | "YEARLY")}
              className={inputClass}
            >
              <option value="MONTHLY">Mensuel</option>
              <option value="YEARLY">Annuel</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-soft sm:mt-7">
            <input
              type="checkbox"
              checked={isNet}
              onChange={(e) => setIsNet(e.target.checked)}
              className="h-4 w-4 border-line text-accent"
            />
            Montant net
          </label>
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="w-full border border-ink bg-ink px-4 py-3.5 font-semibold text-paper transition hover:bg-soft disabled:opacity-50"
      >
        {loading ? "Publication…" : "Publier mon avis"}
      </button>
    </form>
  );
}
