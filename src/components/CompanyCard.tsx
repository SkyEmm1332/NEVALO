import Link from "next/link";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { companyCover } from "@/lib/images";

export type CompanySummary = {
  id: string;
  name: string;
  slug: string | null;
  sector: string | null;
  city: string | null;
  size: string | null;
  score: number | null;
  reviewCount: number;
  rank?: number;
  href?: string;
};

export function CompanyCard({ company }: { company: CompanySummary }) {
  return (
    <Link
      href={company.href ?? `/entreprises/${company.slug ?? company.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={companyCover(company.name)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />

{typeof company.rank === "number" ? (
            <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 font-mono text-xs font-bold text-ink">
              #{company.rank}
            </span>
          ) : null}

        {company.score !== null ? (
          <span className="absolute right-3 top-3 rounded-full bg-surface/95 px-3 py-1 font-mono text-sm font-bold tabular text-accent shadow-sm">
            {company.score}
            <span className="text-[10px] font-normal text-muted">/100</span>
          </span>
        ) : null}

        <div className="absolute inset-x-4 bottom-3 flex items-center gap-3">
          <CompanyAvatar name={company.name} size="h-10 w-10 text-xs ring-2 ring-white/70" />
          <div className="min-w-0">
            <p className="truncate font-bold leading-tight text-white">
              {company.name}
            </p>
            <p className="truncate font-mono text-[11px] uppercase tracking-wide text-white/75">
              {company.sector ?? "Entreprise"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3.5">
        <p className="text-sm text-muted">{company.city ?? "—"}</p>
        <span className="text-sm font-semibold text-ink transition group-hover:text-accent">
          {company.reviewCount} avis →
        </span>
      </div>
    </Link>
  );
}
