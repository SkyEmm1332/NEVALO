import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  computeGlobalScore,
  criterionLabel,
  CRITERIA,
  scoreToStars,
  scoreToFloatStars,
} from "@/lib/rating";
import { aggregateSalaries, formatXOF } from "@/lib/salary";
import { ScoreStamp } from "@/components/ScoreStamp";
import { Stars } from "@/components/Stars";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { ReviewSocial } from "@/components/ReviewSocial";
import { companyCover } from "@/lib/images";
import type { Criterion } from "@prisma/client";

const PERIOD_LABEL: Record<string, string> = {
  MONTHLY: "Mensuel",
  YEARLY: "Annuel",
};

function ratingLabel(score: number | null): string {
  if (score === null) return "Pas encore noté";
  const labels = ["", "Faible", "Moyen", "Bien", "Très bien", "Excellent"];
  return labels[scoreToStars(score)] ?? "Non noté";
}

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; statut?: string }>;
}) {
  const [{ slug }, sp, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ]);
  const sort = sp.sort ?? "recent";
  const statusFilter = sp.statut ?? "all";
  const currentUserId = session?.user?.id ?? null;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      reviews: {
        where: { status: "PUBLISHED" },
        include: {
          ratings: true,
          author: { select: { name: true } },
          responses: { orderBy: { createdAt: "desc" } },
          verifications: { where: { status: "VERIFIED" } },
          likes: { select: { userId: true } },
          replies: {
            include: { author: { select: { name: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      salaryReports: {
        where: { review: { status: "PUBLISHED" } },
        select: {
          jobTitle: true,
          amount: true,
          period: true,
          isNet: true,
          currency: true,
        },
      },
    },
  });

  if (!company || company.status !== "PUBLISHED") {
    notFound();
  }

  const withScore = company.reviews.map((r) => ({
    ...r,
    score: computeGlobalScore(r.ratings),
  }));

  const allRatings = company.reviews.flatMap((r) => r.ratings);
  const score = computeGlobalScore(allRatings);
  const verifiedCount = company.reviews.filter(
    (r) => r.verifications.length > 0,
  ).length;

  const recommendVotes = company.reviews.filter((r) => r.recommend !== null);
  const recommendPct =
    recommendVotes.length > 0
      ? Math.round(
          (recommendVotes.filter((r) => r.recommend === true).length /
            recommendVotes.length) *
            100,
        )
      : null;

  const currentCount = company.reviews.filter((r) => r.isCurrent).length;
  const formerCount = company.reviews.length - currentCount;

  const salaryStats = aggregateSalaries(company.salaryReports);
  const websiteLabel = company.website
    ?.replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const locationLabel =
    company.address ?? (company.city ? `${company.city}, Côte d'Ivoire` : null);

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = withScore.filter(
      (r) => r.score !== null && scoreToStars(r.score) === star,
    ).length;
    return {
      star,
      count,
      pct: withScore.length ? (count / withScore.length) * 100 : 0,
    };
  });

  const criterionAverages = CRITERIA.map(({ key }) => {
    const scores = allRatings
      .filter((r) => r.criterion === key)
      .map((r) => r.score);
    const avg = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;
    return { key: key as Criterion, avg };
  }).filter((c) => c.avg !== null);

  let filtered = withScore;
  if (statusFilter === "current") filtered = filtered.filter((r) => r.isCurrent);
  if (statusFilter === "former") filtered = filtered.filter((r) => !r.isCurrent);
  if (sort === "best")
    filtered = [...filtered].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  else if (sort === "worst")
    filtered = [...filtered].sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
  else
    filtered = [...filtered].sort(
      (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
    );

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Entreprises", href: "/entreprises" },
          { label: company.name },
        ]}
      />
      {/* Bannière entreprise — pleine largeur */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <img
          src={companyCover(company.name)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-ink/20" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-8">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-4">
              <CompanyAvatar
                name={company.name}
                size="h-12 w-12 text-base ring-2 ring-white/30"
              />
              <div className="ml-auto sm:hidden">
                <ScoreStamp score={score} size="sm" />
              </div>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {company.name}
            </h1>

            {company.description ? (
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-paper/75">
                {company.description}
              </p>
            ) : null}

            {(company.website || company.email || company.phone || locationLabel) ? (
              <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-w-0 items-center gap-2.5 text-sm"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5" aria-hidden>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
                      </svg>
                    </span>
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/45">
                        Site web
                      </span>
                      <span className="truncate text-sm text-paper/85 transition group-hover:text-white">
                        {websiteLabel}
                      </span>
                    </span>
                  </a>
                ) : null}

                {company.email ? (
                  <a
                    href={`mailto:${company.email}`}
                    className="group flex min-w-0 items-center gap-2.5 text-sm"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5" aria-hidden>
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3.5 7 7.2 5.1a2 2 0 0 0 2.6 0L20.5 7" />
                      </svg>
                    </span>
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/45">
                        Email
                      </span>
                      <span className="truncate text-sm text-paper/85 transition group-hover:text-white">
                        {company.email}
                      </span>
                    </span>
                  </a>
                ) : null}

                {company.phone ? (
                  <a
                    href={`tel:${company.phone.replace(/\s/g, "")}`}
                    className="group flex min-w-0 items-center gap-2.5 text-sm"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5" aria-hidden>
                        <path d="M6.6 3.5h2.2l1.1 4.2-2 1.4a14 14 0 0 0 6.9 6.9l1.4-2 4.2 1.1v2.2a2.1 2.1 0 0 1-2.3 2.1A17.5 17.5 0 0 1 4.5 5.8a2.1 2.1 0 0 1 2.1-2.3Z" />
                      </svg>
                    </span>
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/45">
                        Téléphone
                      </span>
                      <span className="truncate text-sm text-paper/85 transition group-hover:text-white">
                        {company.phone}
                      </span>
                    </span>
                  </a>
                ) : null}

                {locationLabel ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-w-0 items-center gap-2.5 text-sm"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5" aria-hidden>
                        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="2.6" />
                      </svg>
                    </span>
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/45">
                        Localisation
                      </span>
                      <span className="text-sm leading-snug text-paper/85 transition group-hover:text-white">
                        {locationLabel}
                      </span>
                    </span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="hidden shrink-0 sm:block">
            <ScoreStamp score={score} size="lg" />
          </div>
        </div>

        <div className="relative border-t border-white/15">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
            {[
              [company.reviews.length, "Avis"],
              [verifiedCount, "Vérifiés"],
              [recommendPct === null ? "—" : `${recommendPct}%`, "Recommandent"],
              [`${currentCount}/${formerCount}`, "Actuels / Anciens"],
            ].map(([value, label]) => (
              <div
                key={label as string}
                className="bg-ink/85 px-4 py-2.5 text-center"
              >
                <div className="font-mono text-xl font-bold tabular text-white sm:text-2xl">
                  {value}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-paper/60">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:py-14">
        {/* Synthèse des avis */}
        <section
          aria-label="Synthèse des avis"
          className="border-y border-line-strong bg-surface"
        >
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-12 lg:px-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                Note globale
              </p>
              <div className="mt-3 flex items-end gap-2">
                {score !== null ? (
                  <>
                    <span className="font-display text-6xl font-semibold leading-none tracking-tight text-ink">
                      {score}
                    </span>
                    <span className="mb-1 font-mono text-sm text-muted">
                      / 100
                    </span>
                  </>
                ) : (
                  <span className="font-display text-4xl font-semibold leading-none tracking-tight text-muted">
                    N/A
                  </span>
                )}
              </div>
              <div className="mt-3">
                <Stars
                  value={score !== null ? scoreToFloatStars(score) : 0}
                  size="text-2xl"
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">
                {ratingLabel(score)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Basé sur {company.reviews.length} avis publié
                {company.reviews.length !== 1 ? "s" : ""}, dont {verifiedCount}{" "}
                vérifié{verifiedCount !== 1 ? "s" : ""}.
              </p>
              {recommendPct !== null ? (
                <p className="mt-5 border-t border-line pt-4 text-sm text-soft">
                  <span className="font-mono text-2xl font-bold tabular text-ink">
                    {recommendPct}%
                  </span>{" "}
                  recommandent cette entreprise.
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link
                  href="/deposer-avis"
                  className="bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
                >
                  Déposer un avis
                </Link>
                <Link
                  href="/methode"
                  className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
                >
                  Notre méthode
                </Link>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  Répartition des notes
                </h2>
                <span className="font-mono text-xs text-muted">
                  {company.reviews.length} avis
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {distribution.map(({ star, count, pct }) => (
                  <div
                    key={star}
                    className="grid grid-cols-[2.5rem_1fr_5rem] items-center gap-3 text-sm"
                  >
                    <span className="font-mono text-muted">{star}★</span>
                    <div className="h-2 overflow-hidden bg-paper">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-right font-mono text-xs tabular text-muted">
                      {count} · {Math.round(pct)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-line px-6 py-6 lg:px-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                Notes par critère
              </h2>
              {criterionAverages.length > 0 ? (
                <span className="font-mono text-xs text-muted">
                  Moyenne sur 5
                </span>
              ) : null}
            </div>
            {criterionAverages.length > 0 ? (
              <div className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {criterionAverages.map(({ key, avg }) => (
                  <div key={key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-xs text-soft">
                        {criterionLabel(key)}
                      </span>
                      <span className="font-mono text-xs font-bold tabular text-ink">
                        {avg!.toFixed(1)}/5
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden bg-paper">
                      <div
                        className="h-full bg-ink"
                        style={{ width: `${(avg! / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">
                Pas encore assez de notes pour établir une moyenne par critère.
              </p>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <section className="flex h-full flex-col border border-line bg-surface p-5">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              À propos
            </h2>
            <dl className="mt-4 divide-y divide-line border-t border-line text-sm">
              {company.sector ? (
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted">Secteur</dt>
                  <dd className="text-right font-semibold text-ink">
                    {company.sector}
                  </dd>
                </div>
              ) : null}
              {company.city ? (
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted">Localisation</dt>
                  <dd className="text-right font-semibold text-ink">
                    {company.city}
                  </dd>
                </div>
              ) : null}
              {company.size ? (
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted">Effectif</dt>
                  <dd className="text-right font-semibold text-ink">
                    {company.size}
                  </dd>
                </div>
              ) : null}
              {company.website ? (
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted">Site web</dt>
                  <dd className="min-w-0 text-right">
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      {websiteLabel}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="flex h-full flex-col border border-line bg-paper p-5">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Note descriptive
            </h2>
            {company.legalName ? (
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted">
                {company.legalName}
              </p>
            ) : null}
            <p className="mt-3 text-sm leading-relaxed text-soft">
              {company.description ??
                "Aucune note descriptive n'a encore été renseignée pour cette entreprise."}
            </p>
          </section>

          <section className="flex h-full flex-col border border-line bg-surface p-5">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              En bref
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-soft">Avis publiés</dt>
                <dd className="font-mono font-bold tabular text-ink">
                  {company.reviews.length}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-soft">Avis vérifiés</dt>
                <dd className="font-mono font-bold tabular text-ink">
                  {verifiedCount}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-soft">Actuels / anciens</dt>
                <dd className="font-mono font-bold tabular text-ink">
                  {currentCount} / {formerCount}
                </dd>
              </div>
              {recommendPct !== null ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-soft">Recommandation</dt>
                  <dd className="font-mono font-bold tabular text-accent">
                    {recommendPct}%
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </div>

        <div
          className={`mt-10 grid gap-10 ${
            salaryStats.length > 0
              ? "lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12"
              : ""
          }`}
        >
          <div className="min-w-0">
            <section aria-labelledby="avis-employes">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                    Retours d&apos;expérience
                  </p>
                  <h2
                    id="avis-employes"
                    className="mt-1 text-3xl font-extrabold uppercase tracking-tight text-ink"
                  >
                    Avis des employés
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {filtered.length} avis affiché
                    {filtered.length !== 1 ? "s" : ""} sur{" "}
                    {company.reviews.length}
                  </p>
                </div>
                <form method="GET" className="flex items-center gap-2">
                  <input type="hidden" name="statut" value={statusFilter} />
                  <label
                    htmlFor="sort"
                    className="font-mono text-xs uppercase tracking-wide text-muted"
                  >
                    Trier par
                  </label>
                  <select
                    id="sort"
                    name="sort"
                    defaultValue={sort}
                    className="border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink"
                  >
                    <option value="recent">Plus récents</option>
                    <option value="best">Meilleures notes</option>
                    <option value="worst">Moins bonnes notes</option>
                  </select>
                  <button
                    type="submit"
                    className="border border-ink bg-ink px-3 py-2 text-sm font-semibold text-paper transition hover:bg-soft"
                  >
                    OK
                  </button>
                </form>
              </div>

              <nav
                aria-label="Filtrer les avis"
                className="mt-4 flex flex-wrap gap-5 border-b border-line"
              >
                {[
                  {
                    value: "all",
                    label: "Tous les avis",
                    count: company.reviews.length,
                  },
                  { value: "current", label: "Actuels", count: currentCount },
                  { value: "former", label: "Anciens", count: formerCount },
                ].map((tab) => {
                  const active = statusFilter === tab.value;
                  return (
                    <Link
                      key={tab.value}
                      href={`/entreprises/${slug}?statut=${tab.value}&sort=${sort}`}
                      className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition ${
                        active
                          ? "border-ink text-ink"
                          : "border-transparent text-muted hover:border-line-strong hover:text-ink"
                      }`}
                    >
                      {tab.label}{" "}
                      <span className="font-mono text-xs font-normal text-muted">
                        ({tab.count})
                      </span>
                    </Link>
                  );
                })}
              </nav>

              {filtered.length === 0 ? (
                <div className="mt-6 border border-dashed border-line-strong bg-surface p-12 text-center">
                  <p className="text-muted">
                    {company.reviews.length === 0
                      ? "Aucun avis publié pour cette entreprise. Soyez le premier à partager votre expérience."
                      : "Aucun avis ne correspond à ces filtres."}
                  </p>
                  {company.reviews.length > 0 ? (
                    <Link
                      href={`/entreprises/${slug}`}
                      className="mt-3 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      Réinitialiser les filtres
                    </Link>
                  ) : null}
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {filtered.map((review) => {
                    const verified = review.verifications.length > 0;
                    const reviewStars =
                      review.score === null
                        ? null
                        : scoreToFloatStars(review.score);
                    const authorName =
                      review.visibility === "NOMINATIVE" && review.author.name
                        ? review.author.name
                        : "Anonyme";
                    const initials =
                      authorName === "Anonyme"
                        ? "A"
                        : authorName
                            .split(/\s+/)
                            .map((part) => part[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join("")
                            .toUpperCase();
                    const publishedLabel = review.publishedAt
                      ? new Date(review.publishedAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : null;

                    return (
                      <article
                        key={review.id}
                        className="border border-line bg-surface p-6"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-sm font-bold text-paper">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-ink">
                                  {authorName}
                                </span>
                                {verified ? (
                                  <span className="bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent">
                                    Vérifié
                                  </span>
                                ) : (
                                  <span className="bg-gold/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-[#96680f]">
                                    Non vérifié
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-sm text-soft">
                                {review.jobTitle}
                                {review.location ? ` · ${review.location}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                            {reviewStars !== null ? (
                              <Stars value={reviewStars} size="text-base" />
                            ) : null}
                            {publishedLabel ? (
                              <span className="font-mono text-xs text-muted">
                                {publishedLabel}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-4 space-y-3 text-sm leading-relaxed text-soft">
                          {review.positives ? (
                            <p>
                              <span className="font-bold uppercase tracking-wide text-accent">
                                Points positifs
                              </span>
                              <span className="mt-1 block">
                                {review.positives}
                              </span>
                            </p>
                          ) : null}
                          {review.negatives ? (
                            <p>
                              <span className="font-bold uppercase tracking-wide text-danger">
                                Points à améliorer
                              </span>
                              <span className="mt-1 block">
                                {review.negatives}
                              </span>
                            </p>
                          ) : null}
                        </div>

                        {review.responses.length > 0 ? (
                          <div className="mt-5 space-y-4 border-l-2 border-accent bg-paper p-4">
                            {review.responses.map((resp) => (
                              <div key={resp.id}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-bold text-ink">
                                    Réponse de l&apos;entreprise
                                  </span>
                                  <span className="font-mono text-xs text-muted">
                                    {new Date(
                                      resp.createdAt,
                                    ).toLocaleDateString("fr-FR")}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm leading-relaxed text-soft">
                                  {resp.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 font-mono text-xs text-muted">
                          <span>
                            {review.isCurrent
                              ? "Employé actuel"
                              : "Ancien employé"}
                          </span>
                          {review.contractType ? (
                            <span>· {review.contractType}</span>
                          ) : null}
                          {review.recommend !== null ? (
                            <span
                              className={
                                review.recommend
                                  ? "text-accent"
                                  : "text-danger"
                              }
                            >
                              ·{" "}
                              {review.recommend ? "Recommande" : "Déconseille"}
                            </span>
                          ) : null}
                        </div>

                        <ReviewSocial
                          reviewId={review.id}
                          initialLiked={
                            currentUserId !== null &&
                            review.likes.some(
                              (like) => like.userId === currentUserId,
                            )
                          }
                          initialLikeCount={review.likes.length}
                          initialReplies={review.replies.map((reply) => ({
                            id: reply.id,
                            content: reply.content,
                            createdAt: reply.createdAt.toISOString(),
                            authorName: reply.author.name,
                          }))}
                          isAuthenticated={Boolean(session?.user)}
                          returnTo={`/entreprises/${slug}?statut=${statusFilter}&sort=${sort}`}
                        />
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {salaryStats.length > 0 ? (
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <section className="border border-line bg-surface">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                    Rémunérations déclarées
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Données agrégées, montants individuels jamais affichés.
                  </p>
                </div>
                <div className="divide-y divide-line px-5">
                  {salaryStats.map((s) => (
                    <div
                      key={`${s.jobTitle}-${s.period}-${s.isNet}`}
                      className="py-4"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-semibold text-ink">
                          {s.jobTitle}
                        </span>
                        <span className="font-mono text-sm font-bold tabular text-ink">
                          {formatXOF(s.median)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {formatXOF(s.min)} – {formatXOF(s.max)} ·{" "}
                        {PERIOD_LABEL[s.period] ?? s.period} ·{" "}
                        {s.isNet ? "net" : "brut"} · {s.count} décl.
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          ) : null}
        </div>
      </div>
    </>
  );
}
