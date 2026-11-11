"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type SearchCompany = {
  id: string;
  name: string;
  slug: string | null;
  sector: string | null;
  city: string | null;
  score: number | null;
  reviewCount: number;
};

export function NavbarSearch() {
  const pathname = usePathname();
  return <NavbarSearchInner key={pathname} />;
}

function NavbarSearchInner() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCompany[]>([]);
  const [resultsFor, setResultsFor] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (open && !containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (q.length < 2) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/companies?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as {
          companies?: SearchCompany[];
        };
        if (!controller.signal.aborted) {
          setResults(data.companies ?? []);
          setResultsFor(q);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setResultsFor(q);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [open, query]);

  const trimmedQuery = query.trim();
  const currentResults = resultsFor === trimmedQuery ? results : [];
  const showLoading =
    loading || (trimmedQuery.length >= 2 && resultsFor !== trimmedQuery);

  function closeSearch() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setResultsFor("");
  }

  function goToCompany(company: SearchCompany) {
    closeSearch();
    router.push(`/entreprises/${company.slug ?? company.id}`);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentResults.length > 0) {
      goToCompany(currentResults[0]);
      return;
    }

    if (trimmedQuery) {
      closeSearch();
      router.push(`/entreprises?q=${encodeURIComponent(trimmedQuery)}`);
    }
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open
            ? "w-24 opacity-100 min-[360px]:w-32 sm:w-64"
            : "w-0 opacity-0"
        }`}
      >
        <form onSubmit={onSubmit}>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Entreprise…"
            autoComplete="off"
            tabIndex={open ? 0 : -1}
            aria-label="Rechercher une entreprise"
            className="w-full border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-ink"
          />
        </form>
      </div>

      <button
        type="button"
        onClick={() => {
          if (open) {
            closeSearch();
          } else {
            setOpen(true);
          }
        }}
        aria-label={
          open ? "Fermer la recherche" : "Rechercher une entreprise"
        }
        aria-expanded={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center text-soft transition hover:text-ink"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-5 w-5"
        >
          <circle
            cx="8.5"
            cy="8.5"
            r="5.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="m13 13 4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && trimmedQuery.length >= 2 ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 border border-line bg-surface shadow-card sm:w-80">
          {showLoading ? (
            <p className="px-4 py-3 text-sm text-muted">Recherche…</p>
          ) : null}

          {!showLoading && currentResults.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">
              Aucune entreprise trouvée.
            </p>
          ) : null}

          {!showLoading && currentResults.length > 0 ? (
            <ul className="max-h-80 overflow-auto">
              {currentResults.map((company) => (
                <li key={company.id}>
                  <button
                    type="button"
                    onClick={() => goToCompany(company)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-paper"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {company.name}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-wide text-muted">
                        {[company.sector, company.city]
                          .filter(Boolean)
                          .join(" · ")}
                        {company.reviewCount > 0
                          ? ` · ${company.reviewCount} avis`
                          : ""}
                      </span>
                    </span>
                    {company.score !== null ? (
                      <span className="shrink-0 font-mono text-sm font-bold text-accent">
                        {company.score}/100
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
