import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="border-b border-line bg-paper">
      <ol className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-2 gap-y-1 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:text-[11px]">
        <li>
          <Link href="/" className="transition hover:text-ink">
            Accueil
          </Link>
        </li>
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            <span aria-hidden className="text-muted/40">
              /
            </span>
            {item.href ? (
              <Link href={item.href} className="transition hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
