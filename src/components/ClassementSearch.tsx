"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CompanySummary } from "@/components/CompanyCard";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function ClassementSearch({
  companies,
}: {
  companies: CompanySummary[];
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);

  const results = useMemo(() => {
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];

    return companies
      .filter((company) => {
        const haystack = normalize(
          [company.name, company.sector, company.city].filter(Boolean).join(" "),
        );
        return tokens.every((token) => haystack.includes(token));
      })
      .slice(0, 5);
  }, [companies, normalizedQuery]);

  return (
    <div className="border border-line bg-surface p-5">
      <label
        htmlFor="classement-search"
        className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted"
      >
        Rechercher une entreprise
      </label>

      <div className="relative mt-2">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        >
          <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="m13 13 4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          id="classement-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nom, secteur ou ville…"
          autoComplete="off"
          className="w-full rounded-lg border border-line bg-paper py-3 pl-11 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:border-ink"
        />
      </div>

      <p className="mt-2 text-xs text-muted">
        Tapez le nom d&apos;une entreprise pour afficher directement son rang et
        sa note.
      </p>

      <div aria-live="polite">
        {normalizedQuery.length > 0 ? (
          results.length > 0 ? (
            <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
              {results.map((company, index) => (
                <li
                  key={company.id}
                  className={
                    index === 0
                      ? "rounded-lg border border-amber/60 bg-amber/10 px-3 py-3"
                      : "rounded-lg border border-line bg-paper px-3 py-3"
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 shrink-0 font-mono text-sm font-bold tabular text-muted">
                      #{company.rank ?? "—"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={
                          company.href ??
                          `/entreprises/${company.slug ?? company.id}`
                        }
                        className="block truncate font-semibold text-ink hover:text-accent"
                      >
                        {company.name}
                      </Link>
                      <p className="truncate font-mono text-[10px] uppercase tracking-wide text-muted">
                        {[company.sector, company.city]
                          .filter(Boolean)
                          .join(" · ")}
                        {company.reviewCount > 0
                          ? ` · ${company.reviewCount} avis`
                          : ""}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-base font-bold tabular text-accent">
                      {company.score ?? "—"}
                      <span className="text-[10px] font-normal text-muted">
                        /100
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 border-t border-line pt-4 text-sm text-soft">
              Aucune entreprise classée ne correspond à « {query.trim()} ».
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}
