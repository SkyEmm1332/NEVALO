"use client";

import { useMemo, useState } from "react";
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

const EMPTY_NEW_COMPANY = {
  name: "",
  sector: "",
  city: "",
  size: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  description: "",
};

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
  const [companyQuery, setCompanyQuery] = useState("");
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companyOptions, setCompanyOptions] = useState(companies);
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [newCompany, setNewCompany] = useState(EMPTY_NEW_COMPANY);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [contractType, setContractType] = useState(CONTRACT_TYPES[0]);
  const [location, setLocation] = useState("");
  const [isCurrent, setIsCurrent] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [periodError, setPeriodError] = useState<string | null>(null);
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

  const filteredCompanies = useMemo(() => {
    const query = companyQuery.trim().toLowerCase();
    if (!query) return companyOptions.slice(0, 8);
    return companyOptions
      .filter((company) => company.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [companyOptions, companyQuery]);

  const exactCompany = useMemo(
    () =>
      companyOptions.find(
        (company) =>
          company.name.toLowerCase() === companyQuery.trim().toLowerCase(),
      ) ?? null,
    [companyOptions, companyQuery],
  );

  function selectCompany(company: CompanyOption) {
    setCompanyId(company.id);
    setCompanyQuery(company.name);
    setCompanyOpen(false);
    setShowNewCompany(false);
    setCompanyError(null);
  }

  function openNewCompany(name: string) {
    setNewCompany({ ...EMPTY_NEW_COMPANY, name: name.trim() });
    setShowNewCompany(true);
    setCompanyOpen(false);
    setCompanyError(null);
  }

  async function createCompany() {
    const name = newCompany.name.trim();
    if (!name) {
      setCompanyError("Le nom de l'entreprise est requis.");
      return;
    }

    setCompanyLoading(true);
    setCompanyError(null);

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompany),
      });
      const data = (await response.json().catch(() => ({}))) as {
        id?: string;
        name?: string;
        error?: string;
      };

      if (!response.ok || !data.id || !data.name) {
        setCompanyError(
          data.error ?? "Impossible d'ajouter cette entreprise.",
        );
        return;
      }

      const created = { id: data.id, name: data.name };
      setCompanyOptions((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      selectCompany(created);
    } catch {
      setCompanyError("Impossible d'ajouter cette entreprise.");
    } finally {
      setCompanyLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPeriodError(null);

    if (!companyId) {
      setError("Sélectionnez une entreprise ou ajoutez-la à la liste.");
      return;
    }

    if (!jobTitle.trim()) {
      setError("Indiquez le poste occupé.");
      return;
    }

    if (!isCurrent && startDate && endDate && startDate > endDate) {
      setPeriodError("La date de début doit précéder la date de fin.");
      return;
    }

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
        startDate:
          !isCurrent && startDate ? `${startDate}-01T00:00:00.000Z` : null,
        endDate: !isCurrent && endDate ? `${endDate}-01T00:00:00.000Z` : null,
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
          <div className="sm:col-span-2">
            <label
              className="block text-sm font-semibold text-ink"
              htmlFor="companySearch"
            >
              Entreprise *
            </label>
            <div className="relative">
              <input
                id="companySearch"
                type="search"
                autoComplete="off"
                required
                value={companyQuery}
                onChange={(e) => {
                  setCompanyQuery(e.target.value);
                  setCompanyId("");
                  setCompanyOpen(true);
                }}
                onFocus={() => setCompanyOpen(true)}
                onBlur={() => setCompanyOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                placeholder="Rechercher une entreprise…"
                className={inputClass}
              />
              {companyOpen && !companyId ? (
                <div className="absolute z-30 mt-1 w-full border border-line bg-surface shadow-xl">
                  {filteredCompanies.length > 0 ? (
                    <ul className="max-h-60 overflow-auto">
                      {filteredCompanies.map((company) => (
                        <li key={company.id}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectCompany(company)}
                            className="w-full px-4 py-2.5 text-left text-sm text-soft transition hover:bg-paper hover:text-ink"
                          >
                            {company.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 text-sm text-muted">
                      Aucune entreprise trouvée.
                    </p>
                  )}
                  {companyQuery.trim() && !exactCompany ? (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => openNewCompany(companyQuery)}
                      className="w-full border-t border-line px-4 py-2.5 text-left text-sm font-semibold text-accent transition hover:bg-accent/5"
                    >
                      + Ajouter « {companyQuery.trim()} »
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            {companyId ? (
              <p className="mt-1 text-xs font-semibold text-accent">
                Entreprise sélectionnée.
              </p>
            ) : null}
          </div>
          <div>
            <label
              className="block text-sm font-semibold text-ink"
              htmlFor="jobTitle"
            >
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
            <label
              className="block text-sm font-semibold text-ink"
              htmlFor="contract"
            >
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
            <label
              className="block text-sm font-semibold text-ink"
              htmlFor="location"
            >
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
              onChange={(e) => {
                const checked = e.target.checked;
                setIsCurrent(checked);
                setPeriodError(null);
                if (checked) {
                  setStartDate("");
                  setEndDate("");
                }
              }}
              className="h-4 w-4 border-line text-accent"
            />
            J&apos;y travaille actuellement
          </label>
          {!isCurrent ? (
            <div className="grid gap-4 border-t border-line pt-4 sm:col-span-2 sm:grid-cols-2">
              <div>
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="startDate"
                >
                  Début de la période
                </label>
                <input
                  id="startDate"
                  type="month"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPeriodError(null);
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="endDate"
                >
                  Fin de la période
                </label>
                <input
                  id="endDate"
                  type="month"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPeriodError(null);
                  }}
                  className={inputClass}
                />
              </div>
              {periodError ? (
                <p className="text-sm text-danger sm:col-span-2">
                  {periodError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {showNewCompany ? (
          <div
            className="mt-4 border border-line bg-paper p-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          >
            <p className="text-sm font-semibold text-ink">
              Ajouter une entreprise
            </p>
            <p className="mt-1 text-xs text-muted">
              Renseignez les informations que vous connaissez. L&apos;équipe
              NEVALO vérifiera et complétera la fiche.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["name", "Nom *", "text"],
                  ["sector", "Secteur", "text"],
                  ["city", "Ville", "text"],
                  ["size", "Effectif", "text"],
                  ["website", "Site web", "url"],
                  ["email", "Email de contact", "email"],
                  ["phone", "Téléphone", "tel"],
                  ["address", "Adresse", "text"],
                ] as const
              ).map(([key, placeholder, type]) => (
                <input
                  key={key}
                  type={type}
                  value={newCompany[key]}
                  onChange={(e) =>
                    setNewCompany((current) => ({
                      ...current,
                      [key]: e.target.value,
                    }))
                  }
                  placeholder={placeholder}
                  className={inputClass}
                />
              ))}
              <textarea
                value={newCompany.description}
                onChange={(e) =>
                  setNewCompany((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
                rows={2}
                placeholder="Description"
                className={`${inputClass} sm:col-span-2`}
              />
            </div>
            {companyError ? (
              <p className="mt-3 text-sm text-danger">{companyError}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={createCompany}
                disabled={companyLoading}
                className="bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-soft disabled:opacity-50"
              >
                {companyLoading ? "Création…" : "Créer et sélectionner"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewCompany(false);
                  setCompanyError(null);
                }}
                className="border border-line px-4 py-2 text-sm font-semibold text-soft transition hover:border-ink hover:text-ink"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : null}
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
                    className={`px-0.5 text-3xl leading-none transition sm:text-4xl ${
                      n <= ratings[key]
                        ? "text-gold"
                        : "text-ink/15 hover:text-gold/40"
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
        <p className="mt-3 text-xs text-muted">
          Avis anonyme : votre fonction sera masquée si vous êtes encore en
          poste. Elle restera visible si vous avez quitté l&apos;entreprise.
        </p>
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
