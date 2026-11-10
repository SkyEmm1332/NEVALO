import Image from "next/image";
import Link from "next/link";
import { getCompaniesWithScore } from "@/lib/companies";
import { MIN_SCORE_FOR_RANKING } from "@/lib/rating";
import { companyCover } from "@/lib/images";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { CompanyCard } from "@/components/CompanyCard";
import type { CompanySummary } from "@/components/CompanyCard";
import { ClassementSearch } from "@/components/ClassementSearch";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

export default async function ClassementsPage() {
  const companies = await getCompaniesWithScore();
  const realRanked = companies
    .filter((c) => c.score !== null && c.reviewCount >= MIN_SCORE_FOR_RANKING)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const scored = companies
    .filter((c) => c.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const usingPreview = realRanked.length === 0;
  const ranked: CompanySummary[] = (usingPreview ? scored : realRanked).map(
    (company, index) => ({
      ...company,
      rank: index + 1,
    }),
  );
  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <>
      <PageHero
        eyebrow="Registre · Palmarès"
        title={
          usingPreview ? (
            <>
              Classements{" "}
              <span className="relative inline-block whitespace-nowrap">
                provisoires
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                  fill="none"
                  className="absolute -bottom-2 left-0 h-3 w-full text-amber"
                >
                  <path
                    d="M3 8C24 3 45 10 71 5C82 3 91 5 97 4"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M6 10C30 6 56 12 94 7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    opacity="0.55"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </span>
            </>
          ) : (
            "Classements"
          )
        }
        description={`Le classement officiel s'active dès qu'une entreprise atteint ${MIN_SCORE_FOR_RANKING} avis publiés. En attendant, voici un aperçu provisoire des entreprises déjà évaluées.`}
        stats={[
          {
            value: String(ranked.length),
            label: usingPreview
              ? "entreprises évaluées"
              : "entreprises classées",
          },
          { value: String(MIN_SCORE_FOR_RANKING), label: "avis minimum" },
          { value: "/100", label: "indice de note" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <aside className="space-y-5 lg:sticky lg:top-24 lg:order-2 lg:self-start">
            {ranked.length > 0 ? (
              <Reveal>
                <ClassementSearch companies={ranked} />
              </Reveal>
            ) : null}

            <Reveal>
              <div className="border border-line bg-surface p-6">
                <p className="font-semibold text-ink">
                  Comment une entreprise entre-t-elle au classement ?
                </p>
                <p className="mt-1 text-sm text-soft">
                  {usingPreview
                    ? `Aucune entreprise n'a encore atteint ${MIN_SCORE_FOR_RANKING} avis. Cet aperçu provisoire affiche toutes les entreprises déjà évaluées, quel que soit leur nombre d'avis. Il disparaîtra dès qu'une entreprise atteindra le seuil.`
                    : `Le classement officiel est actif : au moins une entreprise a atteint ${MIN_SCORE_FOR_RANKING} avis publiés. Les entreprises sous ce seuil ne sont pas classées et n'apparaissent pas ici ; leur note reste indicative sur leur fiche.`}
                </p>
                <Link
                  href="/methode#classement"
                  className="mt-3 inline-block text-sm font-semibold text-accent transition hover:text-accent-deep"
                >
                  Voir la méthodologie →
                </Link>
              </div>
            </Reveal>
          </aside>

          <div className="min-w-0 lg:order-1">
            {ranked.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line-strong bg-surface p-12 text-center">
                <p className="text-lg font-semibold text-ink">
                  Pas encore assez d&apos;avis pour un classement fiable
                </p>
                <p className="mx-auto mt-2 max-w-md text-soft">
                  Une entreprise doit réunir au moins {MIN_SCORE_FOR_RANKING}{" "}
                  avis publiés pour être classée. Déposez le premier avis.
                </p>
                <Link
                  href="/deposer-avis"
                  className="mt-5 inline-block rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
                >
                  Déposer un avis
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {podium.map((c, i) => (
                    <Reveal key={c.id} delay={i * 80}>
                      <CompanyCard company={{ ...c, rank: i + 1 }} />
                    </Reveal>
                  ))}
                </div>

                {rest.length > 0 ? (
                  <Reveal>
                    <ol className="mt-8 overflow-hidden rounded-xl border border-line bg-surface">
                      {rest.map((c, i) => (
                        <li
                          key={c.id}
                          className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-b-0"
                        >
                          <span className="w-8 font-mono text-sm font-bold tabular text-muted">
                            {String(i + 4).padStart(2, "0")}
                          </span>
                          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={companyCover(c.name)}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                          <CompanyAvatar name={c.name} size="h-9 w-9 text-xs" />
                          <div className="min-w-0 flex-1">
                            <Link
                              href={c.href ?? `/entreprises/${c.slug ?? c.id}`}
                              className="font-semibold text-ink hover:text-accent"
                            >
                              {c.name}
                            </Link>
                            <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
                              {[c.sector, c.city].filter(Boolean).join(" · ")} ·{" "}
                              {c.reviewCount} avis
                            </p>
                          </div>
                          <span className="font-mono text-lg font-bold tabular text-accent">
                            {c.score}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </Reveal>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
