import Link from "next/link";

type AdminPaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  totalItems: number;
  labels: { singular: string; plural: string };
  query?: Record<string, string | undefined>;
  className?: string;
};

function buildHref(
  basePath: string,
  query: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (!value || value === "ALL" || value === "all") continue;
    params.set(key, value);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

function pageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);

  return items;
}

export function AdminPagination({
  basePath,
  page,
  totalPages,
  totalItems,
  labels,
  query = {},
  className = "",
}: AdminPaginationProps) {
  const items = pageItems(page, totalPages);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper px-4 py-3 ${className}`}
    >
      <p className="text-xs text-muted">
        {totalItems} {totalItems === 1 ? labels.singular : labels.plural}
        {totalPages > 1 ? ` · page ${page} sur ${totalPages}` : null}
      </p>

      {totalPages > 1 ? (
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center gap-1"
        >
          {page > 1 ? (
            <Link
              href={buildHref(basePath, query, page - 1)}
              className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-soft transition hover:border-ink hover:text-ink"
            >
              Précédent
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-muted opacity-40"
            >
              Précédent
            </span>
          )}

          {items.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1.5 text-xs text-muted"
              >
                …
              </span>
            ) : item === page ? (
              <span
                key={item}
                aria-current="page"
                className="rounded-md border border-accent bg-accent px-2.5 py-1.5 text-xs font-medium text-white"
              >
                {item}
              </span>
            ) : (
              <Link
                key={item}
                href={buildHref(basePath, query, item)}
                className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-soft transition hover:border-ink hover:text-ink"
              >
                {item}
              </Link>
            ),
          )}

          {page < totalPages ? (
            <Link
              href={buildHref(basePath, query, page + 1)}
              className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-soft transition hover:border-ink hover:text-ink"
            >
              Suivant
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-muted opacity-40"
            >
              Suivant
            </span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
