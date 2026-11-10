import Link from "next/link";
import type { Criterion } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CRITERIA,
  computeGlobalScore,
  formatRating,
  scoreToFloatStars,
} from "@/lib/rating";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { PageHero } from "@/components/PageHero";
import { Stars } from "@/components/Stars";
import { distinctCompanyThemes } from "@/lib/company-color";

export const metadata = {
  title: "Comparer des entreprises · NEVALO",
};

const MAX_COMPARE = 3;

type SearchParams = Promise<{ ids?: string | string[] }>;

function EmptyComparison({ invalid = false }: { invalid?: boolean }) {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Entreprises", href: "/entreprises" },
          { label: "Comparaison" },
        ]}
      />
      <PageHero
        eyebrow="Registre · Comparaison"
        title="Comparer des entreprises"
        description="Confrontez les notes globales et les notes par critère de deux ou trois employeurs, sur la base des avis publiés."
      />
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="rounded-xl border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="text-lg font-semibold text-ink">
            {invalid
              ? "Sélection incomplète"
              : "Deux entreprises minimum"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-soft">
            {invalid
              ? "Les entreprises demandées sont introuvables ou ne sont plus publiées. Reconstruisez votre sélection."
              : "Choisissez 2 ou 3 entreprises dans l'annuaire pour lancer la comparaison."}
          </p>
          <Link
            href="/entreprises"
            className="mt-5 inline-block rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
          >
            Choisir des entreprises
          </Link>
        </div>
      </div>
    </>
  );
}

export default async function CompareCompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.ids) ? sp.ids.join(",") : (sp.ids ?? "");
  const ids = Array.from(
    new Set(
      raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).slice(0, MAX_COMPARE);

  if (ids.length < 2) {
    return <EmptyComparison />;
  }

  const companies = await prisma.company.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    include: {
      reviews: {
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          isCurrent: true,
          recommend: true,
          ratings: { select: { criterion: true, score: true } },
          verifications: {
            where: { status: "VERIFIED" },
            select: { id: true },
          },
        },
      },
    },
  });

  const ordered = ids
    .map((id) => companies.find((company) => company.id === id))
    .filter((company): company is NonNullable<typeof company> =>
      Boolean(company),
    );

  if (ordered.length < 2) {
    return <EmptyComparison invalid />;
  }

  const themes = distinctCompanyThemes(
    ordered.map((company) => company.name),
  );

  const columns = ordered.map((company, index) => {
    const allRatings = company.reviews.flatMap((review) => review.ratings);
    const score = computeGlobalScore(allRatings);
    const criterionAverages = CRITERIA.map(({ key }) => {
      const scores = allRatings
        .filter((rating) => rating.criterion === key)
        .map((rating) => rating.score);
      return {
        key,
        avg: scores.length
          ? scores.reduce((sum, value) => sum + value, 0) / scores.length
          : null,
      };
    });
    const recommendVotes = company.reviews.filter(
      (review) => review.recommend !== null,
    );
    const recommendPct =
      recommendVotes.length > 0
        ? Math.round(
            (recommendVotes.filter((review) => review.recommend === true)
              .length /
              recommendVotes.length) *
              100,
          )
        : null;
    const verifiedCount = company.reviews.filter(
      (review) => review.verifications.length > 0,
    ).length;
    const currentCount = company.reviews.filter(
      (review) => review.isCurrent,
    ).length;

    return {
      company,
      theme: themes[index],
      score,
      criterionAverages,
      recommendPct,
      verifiedCount,
      currentCount,
      formerCount: company.reviews.length - currentCount,
    };
  });

  const bestScore = Math.max(...columns.map((column) => column.score ?? -1));
  const bestRecommend = Math.max(
    ...columns.map((column) => column.recommendPct ?? -1),
  );
  const bestCriterion = (key: Criterion) =>
    Math.max(
      ...columns.map(
        (column) =>
          column.criterionAverages.find((item) => item.key === key)?.avg ??
          -1,
      ),
    );

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Entreprises", href: "/entreprises" },
          { label: "Comparaison" },
        ]}
      />

      <PageHero
        eyebrow="Registre · Comparaison"
        title="Comparer les entreprises"
        description="Notes globales, recommandation et notes par critère : les meilleures valeurs de chaque ligne sont mises en évidence."
        stats={[
          { value: String(columns.length), label: "entreprises" },
          { value: String(CRITERIA.length), label: "critères" },
          { value: "/100", label: "indice de note" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-soft">
            Comparaison directe des employeurs sélectionnés. Données issues des
            avis publiés uniquement.
          </p>
          <Link
            href="/entreprises"
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink"
          >
            Modifier la sélection
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[780px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line-strong">
                <th className="sticky left-0 z-10 w-52 border-r border-line-strong bg-surface px-4 py-5 text-left align-top font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  Critère
                </th>
                {columns.map(({ company, score, theme }) => (
                  <th
                    key={company.id}
                    className={`min-w-[220px] border-l border-t-4 ${theme.divider} ${theme.top} ${theme.tint} px-4 py-5 text-left align-top`}
                  >
                    <Link
                      href={`/entreprises/${company.slug ?? company.id}`}
                      className="group flex items-center gap-3"
                    >
                      <CompanyAvatar
                        name={company.name}
                        color={theme.avatar}
                        size="h-10 w-10 text-xs"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-base font-bold text-ink">
                          {company.name}
                        </span>
                        <span className="block truncate font-mono text-[10px] uppercase tracking-wide text-muted">
                          {company.sector ?? "Entreprise"}
                        </span>
                      </span>
                    </Link>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span
                        className={`font-mono text-3xl font-bold tabular ${theme.text}`}
                      >
                        {score ?? "—"}
                      </span>
                      <span className="text-xs text-muted">/100</span>
                    </div>
                    <div className="mt-1">
                      <Stars
                        value={score !== null ? scoreToFloatStars(score) : 0}
                        size="text-sm"
                      />
                    </div>
                    <Link
                      href={`/entreprises/${company.slug ?? company.id}`}
                      className={`mt-3 inline-block text-xs font-semibold underline-offset-4 hover:underline ${theme.text}`}
                    >
                      Voir la fiche →
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-line bg-paper">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-line-strong bg-paper px-4 py-4 text-left text-sm font-semibold text-ink"
                >
                  Indice global
                </th>
                {columns.map((column) => {
                  const isBest =
                    column.score !== null &&
                    bestScore > 0 &&
                    column.score === bestScore;
                  return (
                    <td
                      key={column.company.id}
                      className={`border-l px-4 py-4 ${column.theme.divider} ${
                        isBest ? "bg-gold/20" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-2xl font-bold tabular text-ink">
                          {column.score ?? "—"}
                        </span>
                        <span className="text-xs text-muted">/100</span>
                        {isBest ? (
                          <span className="rounded-full bg-gold px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-ink">
                            Meilleure note
                          </span>
                        ) : null}
                      </div>
                    </td>
                  );
                })}
              </tr>

              <tr className="border-b border-line">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-line-strong bg-surface px-4 py-3 text-left text-sm font-medium text-soft"
                >
                  Avis publiés
                </th>
                {columns.map((column) => (
                  <td
                    key={column.company.id}
                    className={`border-l px-4 py-3 font-mono text-sm tabular text-ink ${column.theme.divider}`}
                  >
                    {column.company.reviews.length}
                    <span className="ml-2 font-sans text-xs font-normal text-muted">
                      dont {column.verifiedCount} vérifié
                      {column.verifiedCount !== 1 ? "s" : ""}
                    </span>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-line">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-line-strong bg-surface px-4 py-3 text-left text-sm font-medium text-soft"
                >
                  Recommandent
                </th>
                {columns.map((column) => {
                  const isBest =
                    column.recommendPct !== null &&
                    bestRecommend > 0 &&
                    column.recommendPct === bestRecommend;
                  return (
                    <td
                      key={column.company.id}
                      className={`border-l px-4 py-3 ${column.theme.divider} ${
                        isBest ? "bg-gold/20" : ""
                      }`}
                    >
                      {column.recommendPct === null ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <span className="font-mono text-sm font-bold tabular text-ink">
                          {column.recommendPct}%
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              <tr className="border-b border-line">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-line-strong bg-surface px-4 py-3 text-left text-sm font-medium text-soft"
                >
                  Actuels / anciens
                </th>
                {columns.map((column) => (
                  <td
                    key={column.company.id}
                    className={`border-l px-4 py-3 font-mono text-sm tabular text-ink ${column.theme.divider}`}
                  >
                    {column.currentCount} / {column.formerCount}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-line">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-line-strong bg-surface px-4 py-3 text-left text-sm font-medium text-soft"
                >
                  Ville
                </th>
                {columns.map((column) => (
                  <td
                    key={column.company.id}
                    className={`border-l px-4 py-3 text-soft ${column.theme.divider}`}
                  >
                    {column.company.city ?? "—"}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-line">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-line-strong bg-surface px-4 py-3 text-left text-sm font-medium text-soft"
                >
                  Effectif
                </th>
                {columns.map((column) => (
                  <td
                    key={column.company.id}
                    className={`border-l px-4 py-3 text-soft ${column.theme.divider}`}
                  >
                    {column.company.size ?? "—"}
                  </td>
                ))}
              </tr>

              <tr>
                <th
                  colSpan={columns.length + 1}
                  className="bg-paper px-4 py-2 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
                >
                  Notes par critère · moyenne sur 5
                </th>
              </tr>

              {CRITERIA.map(({ key, label }) => {
                const best = bestCriterion(key);
                return (
                  <tr
                    key={key}
                    className="border-t border-line last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-r border-line-strong bg-surface px-4 py-3 text-left text-sm font-medium text-soft"
                    >
                      {label}
                    </th>
                    {columns.map((column) => {
                      const avg =
                        column.criterionAverages.find(
                          (item) => item.key === key,
                        )?.avg ?? null;
                      const isBest =
                        avg !== null &&
                        best > 0 &&
                        Math.abs(avg - best) < 0.001;
                      return (
                        <td
                          key={column.company.id}
                          className={`border-l px-4 py-3 ${column.theme.divider} ${
                            isBest ? "bg-gold/20" : ""
                          }`}
                        >
                          {avg === null ? (
                            <span className="text-muted">—</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {isBest ? (
                                <span
                                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                                  aria-hidden
                                />
                              ) : null}
                              <span
                                className={`font-mono text-sm tabular text-ink ${
                                  isBest ? "font-bold" : ""
                                }`}
                              >
                                {formatRating(avg)}
                              </span>
                              <span className="text-[10px] text-muted">/5</span>
                              <div className="h-1.5 w-16 overflow-hidden bg-paper">
                                <div
                                  className={`h-full ${
                                    isBest ? "bg-gold" : "bg-ink/40"
                                  }`}
                                  style={{ width: `${(avg / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          Les valeurs surlignées en jaune correspondent au meilleur résultat de
          chaque ligne. Une entreprise sans avis publié reste sélectionnable
          mais n&apos;affiche aucune note.
        </p>
      </div>
    </>
  );
}
