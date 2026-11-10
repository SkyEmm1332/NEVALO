"use client";

import { useState } from "react";
import Link from "next/link";
import { CompanyCard } from "@/components/CompanyCard";
import type { CompanySummary } from "@/components/CompanyCard";

const MAX_COMPARE = 3;

export function CompanyCompare({ companies }: { companies: CompanySummary[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  function toggle(id: string) {
    setNotice(null);
    if (selected.includes(id)) {
      setSelected(selected.filter((value) => value !== id));
      return;
    }
    if (selected.length >= MAX_COMPARE) {
      setNotice(
        `Vous pouvez comparer ${MAX_COMPARE} entreprises maximum. Retirez-en une pour en ajouter une autre.`,
      );
      return;
    }
    setSelected([...selected, id]);
  }

  const selectedCompanies = selected
    .map((id) => companies.find((company) => company.id === id))
    .filter((company): company is CompanySummary => Boolean(company));

  const canCompare = selectedCompanies.length >= 2;
  const compareHref = `/entreprises/comparer?ids=${selectedCompanies
    .map((company) => company.id)
    .join(",")}`;

  return (
    <div>
      {selected.length > 0 ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSelected([]);
              setNotice(null);
            }}
            className="font-mono text-xs uppercase tracking-wide text-muted underline-offset-4 transition hover:text-ink hover:underline"
          >
            Tout effacer
          </button>
        </div>
      ) : null}

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {companies.map((company) => {
          const isSelected = selected.includes(company.id);
          return (
            <div
              key={company.id}
              className={`relative rounded-xl transition ${
                isSelected ? "ring-2 ring-accent ring-offset-2 ring-offset-paper" : ""
              }`}
            >
              <CompanyCard company={company} />
              <button
                type="button"
                onClick={() => toggle(company.id)}
                aria-pressed={isSelected}
                aria-label={
                  isSelected
                    ? `Retirer ${company.name} de la comparaison`
                    : `Ajouter ${company.name} à la comparaison`
                }
                className={`absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide shadow-sm transition ${
                  isSelected
                    ? "bg-accent text-white"
                    : "bg-surface/95 text-ink hover:bg-surface hover:text-accent"
                }`}
              >
                {isSelected ? "✓ Sélectionnée" : "Comparer"}
              </button>
            </div>
          );
        })}
      </div>

      {selectedCompanies.length > 0 ? (
        <div className="sticky bottom-4 z-20 mt-6 rounded-xl border border-line bg-surface/95 p-4 shadow-lift backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Comparaison
              </span>
              {selectedCompanies.map((company) => (
                <span
                  key={company.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-ink"
                >
                  {company.name}
                  <button
                    type="button"
                    onClick={() => toggle(company.id)}
                    aria-label={`Retirer ${company.name}`}
                    className="text-muted transition hover:text-danger"
                  >
                    ×
                  </button>
                </span>
              ))}
              {Array.from({
                length: MAX_COMPARE - selectedCompanies.length,
              }).map((_, index) => (
                <span
                  key={`empty-${index}`}
                  className="rounded-full border border-dashed border-line-strong px-2.5 py-1 text-xs text-muted"
                >
                  Emplacement libre
                </span>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-xs text-muted">
                {selectedCompanies.length}/{MAX_COMPARE}
              </span>
              {canCompare ? (
                <Link
                  href={compareHref}
                  className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
                >
                  Comparer les notes →
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="cursor-not-allowed rounded-lg bg-ink/40 px-5 py-2.5 text-sm font-semibold text-paper/70"
                >
                  Comparer les notes
                </span>
              )}
            </div>
          </div>
          {notice ? (
            <p className="mt-2 text-xs text-danger">{notice}</p>
          ) : (
            <p className="mt-2 text-xs text-muted">
              {canCompare
                ? "Lancez la comparaison pour voir les notes critère par critère."
                : "Ajoutez encore une entreprise pour activer la comparaison."}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
