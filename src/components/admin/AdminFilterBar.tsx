import Link from "next/link";
import type { ReactNode } from "react";

export function AdminFilterBar({
  action,
  resetHref,
  hasFilters,
  children,
  layoutClassName = "flex flex-col gap-3 sm:flex-row sm:items-end",
}: {
  action: string;
  resetHref: string;
  hasFilters: boolean;
  children: ReactNode;
  layoutClassName?: string;
}) {
  return (
    <form
      method="get"
      action={action}
      className="rounded-lg border border-line bg-surface p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
          Filtres
        </span>
        {hasFilters ? (
          <Link
            href={resetHref}
            className="text-xs font-medium text-accent transition hover:underline"
          >
            Réinitialiser
          </Link>
        ) : null}
      </div>

      <div className={layoutClassName}>
        {children}
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-deep"
        >
          Filtrer
        </button>
      </div>
    </form>
  );
}
