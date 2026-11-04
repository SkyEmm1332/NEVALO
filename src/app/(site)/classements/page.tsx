import Link from "next/link";
import { getCompaniesWithScore } from "@/lib/companies";
import { MIN_SCORE_FOR_RANKING } from "@/lib/rating";
import { companyCover } from "@/lib/images";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { CompanyCard } from "@/components/CompanyCard";
import type { CompanySummary } from "@/components/CompanyCard";
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

  const usingPreview = realRanked.length < 3;
  const ranked: CompanySummary[] = usingPreview ? scored : realRanked;
  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <>
      <PageHero
        eyebrow="Registre · Palmarès"
        title="Classements"
        description={`Le classement officiel s'active à partir de ${MIN_SCORE_FOR_RANKING} avis par entreprise. En attendant, voici un aperçu provisoire des entreprises déjà évaluées.`}
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
        {usingPreview ? (
          <Reveal>
            <div className="mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-gold/40 bg-gold/10 px-5 py-4">
              <span className="rounded-sm bg-gold px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-ink">
                Aperçu
              </span>
              <p className="text-sm text-soft">
                Le seuil de {MIN_SCORE_FOR_RANKING} avis n&apos;est pas encore
                atteint. Les notes affichées sont provisoires et se
                consolideront avec les prochains avis publiés.
              </p>
            </div>
          </Reveal>
        ) : null}

        {ranked.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-12 text-center">
            <p className="text-lg font-semibold text-ink">
              Pas encore assez d&apos;avis pour un classement fiable
            </p>
            <p className="mx-auto mt-2 max-w-md text-soft">
              Une entreprise doit réunir au moins {MIN_SCORE_FOR_RANKING} avis
              publiés pour être classée. Déposez le premier avis.
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                        <img
                          src={companyCover(c.name)}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
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

        <Reveal>
          <div className="mt-10 rounded-xl border border-line bg-surface p-6">
            <p className="font-semibold text-ink">
              Comment une entreprise entre-t-elle au classement ?
            </p>
            <p className="mt-1 text-sm text-soft">
              Une entreprise doit avoir au moins {MIN_SCORE_FOR_RANKING} avis
              publiés. En dessous, sa note reste indicative et n&apos;apparaît pas
              ici.
            </p>
            <Link
              href="/methode"
              className="mt-3 inline-block text-sm font-semibold text-accent transition hover:text-accent-deep"
            >
              Voir la méthodologie →
            </Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}
