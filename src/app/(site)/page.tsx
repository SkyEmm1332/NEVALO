import Link from "next/link";
import { getCompaniesWithScore } from "@/lib/companies";
import { prisma } from "@/lib/prisma";
import { computeGlobalScore, scoreToFloatStars } from "@/lib/rating";
import { PHOTOS, companyCover } from "@/lib/images";
import { CompanyCard } from "@/components/CompanyCard";
import { Stars } from "@/components/Stars";
import { CompanyCarousel } from "@/components/CompanyCarousel";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { Reveal } from "@/components/Reveal";

export default async function Home() {
  const [companies, latestReviews, companyCount, reviewCount, userCount, sectors, cities] =
    await Promise.all([
      getCompaniesWithScore(),
      prisma.review.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 6,
        include: {
          company: { select: { name: true, slug: true } },
          ratings: true,
        },
      }),
      prisma.company.count({ where: { status: "PUBLISHED" } }),
      prisma.review.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count(),
      prisma.company.groupBy({
        by: ["sector"],
        where: { status: "PUBLISHED", sector: { not: null } },
        _count: { _all: true },
      }),
      prisma.company.groupBy({
        by: ["city"],
        where: { status: "PUBLISHED", city: { not: null } },
        _count: { _all: true },
      }),
    ]);

  const topCompanies = companies
    .filter((c) => c.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);

  const sectorList = sectors
    .map((s) => ({ name: s.sector as string, count: s._count._all }))
    .sort((a, b) => b.count - a.count);
  const cityList = cities
    .map((c) => ({ name: c.city as string, count: c._count._all }))
    .sort((a, b) => b.count - a.count);

  const reviewSlides = latestReviews.map((r) => ({
    id: r.id,
    companyName: r.company.name,
    companySlug: r.company.slug,
    jobTitle: r.jobTitle,
    positives: r.positives,
    score: computeGlobalScore(r.ratings),
    date: r.publishedAt
      ? new Date(r.publishedAt).toLocaleDateString("fr-FR")
      : "",
    isCurrent: r.isCurrent,
  }));

  const steps = [
    {
      title: "Créez un compte",
      desc: "Inscription gratuite en moins d'une minute. Vous gardez le contrôle sur la visibilité de chaque avis.",
    },
    {
      title: "Déposez votre expérience",
      desc: "Poste, contrat, ancienneté, note par critère, points positifs et négatifs, et votre rémunération (facultative).",
    },
    {
      title: "Vérification puis publication",
      desc: "Prouvez votre lien avec l'entreprise pour être « vérifié ». Les avis sont modérés avant publication.",
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-ink text-paper">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 55% at 85% 0%, rgba(20,184,166,0.28), transparent 70%), radial-gradient(40% 50% at 0% 100%, rgba(232,146,12,0.16), transparent 70%)",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-12 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <div>
            <p
              className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-teal"
              style={{ animationDelay: "0ms" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              Registre indépendant
              <span className="hidden sm:inline"> · Côte d&apos;Ivoire</span>
            </p>

            <h1
              className="animate-fade-up mt-6 text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "80ms" }}
            >
              Choisissez un employeur,
              <span className="mt-1 block text-teal">pas une promesse.</span>
            </h1>

            <p
              className="animate-fade-up mt-6 max-w-lg text-lg leading-relaxed text-paper/75"
              style={{ animationDelay: "160ms" }}
            >
              Des expériences de travail réelles, vérifiées et anonymes, pour
              savoir dans quoi vous vous engagez avant de signer.
            </p>

            <form
              action="/entreprises"
              method="GET"
              className="animate-fade-up mt-8 flex max-w-lg items-center gap-1.5 rounded-xl bg-surface p-1.5 shadow-lift"
              style={{ animationDelay: "240ms" }}
            >
              <span className="pl-3 text-muted" aria-hidden>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                type="text"
                name="q"
                placeholder="Entreprise, secteur…"
                className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm text-ink outline-none placeholder:text-muted sm:text-base"
              />
              <button
                type="submit"
                className="rounded-lg bg-gold px-4 py-2.5 font-bold text-ink transition hover:bg-amber sm:px-5"
              >
                Rechercher
              </button>
            </form>

            <div
              className="animate-fade-up mt-4 flex flex-wrap items-center gap-2 text-xs text-paper/55"
              style={{ animationDelay: "300ms" }}
            >
              <span className="font-mono uppercase tracking-wide">
                Populaire
              </span>
              {["Banque", "Technologie", "Abidjan", "Santé"].map((q) => (
                <Link
                  key={q}
                  href={`/entreprises?q=${encodeURIComponent(q)}`}
                  className="rounded-full border border-white/15 px-3 py-1 text-paper/80 transition hover:border-teal hover:text-teal"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>

          {/* Collage photo + fiche de note */}
          <div className="relative">
            <div className="mx-auto grid max-w-md grid-cols-[1.3fr_1fr] gap-3 lg:max-w-none">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-white/10">
                <img
                  src={PHOTOS.hero}
                  alt="Deux collègues échangeant devant un ordinateur"
                  className="h-full w-full object-cover"
                />
<div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
<span className="absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-paper backdrop-blur">
              Avis vérifié
            </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/10">
                  <img
                    src={PHOTOS.mission}
                    alt="Équipe en réunion dans un bureau"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between rounded-2xl bg-surface p-4 text-ink">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                      Indice NEVALO
                    </p>
                    <p className="mt-1 font-mono text-4xl font-bold leading-none tabular text-accent">
                      72
                      <span className="text-sm font-normal text-muted">
                        /100
                      </span>
                    </p>
                    <div className="mt-2">
                      <Stars value={scoreToFloatStars(72)} size="text-xs" />
                    </div>
                  </div>
                  <p className="mt-3 border-t border-line pt-2 text-[11px] text-muted">
                    Ivoire Tech · 38 avis
                  </p>
                </div>
              </div>
            </div>

            <div className="animate-float absolute -left-4 bottom-8 hidden max-w-[190px] rounded-xl bg-paper px-4 py-3 text-ink shadow-lift sm:block">
              <p className="text-xs font-semibold leading-snug">
                « On sait enfin à quoi s&apos;attendre avant de signer. »
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase text-muted">
                Amina · Abidjan
              </p>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-6 py-6 sm:grid-cols-4">
            {[
              [companyCount, "Entreprises référencées"],
              [reviewCount, "Avis publiés"],
              [userCount, "Membres inscrits"],
              ["9", "Critères pondérés"],
            ].map(([value, label]) => (
              <div
                key={label as string}
                className="flex items-baseline gap-2 sm:flex-col sm:items-start sm:gap-1"
              >
                <span className="font-mono text-2xl font-bold tabular text-white">
                  {value}
                </span>
                <span className="text-xs text-paper/60">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-paper">
        <div className="mx-auto grid grid-cols-1 w-full max-w-7xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <img
                src={PHOTOS.howItWorks}
                alt="Une équipe collaborant autour d'un ordinateur"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                En 3 étapes
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Comment ça marche
              </h2>
            </Reveal>
            <ol className="mt-8 space-y-7">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 70}>
                  <li className="flex gap-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-ink">
                        {s.title}
                      </h3>
                      <p className="mt-1 leading-relaxed text-soft">{s.desc}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* MÉTHODOLOGIE */}
      <section className="bg-surface">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  Méthodologie
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Une note qui s&apos;explique
                </h2>
                <p className="mt-4 max-w-lg leading-relaxed text-soft">
                  Pas de boîte noire. Chaque avis note 9 critères pondérés, et le
                  calcul est reproductible : une note sur 100, comprise de tous.
                </p>

                <ul className="mt-8 space-y-5">
                  {[
                    [
                      "01",
                      "Neuf critères, un seul indice",
                      "Ambiance, management, rémunération, évolution… tout est agrégé dans une note unique.",
                    ],
                    [
                      "02",
                      "Une pondération fixe et publique",
                      "Chaque critère a un poids connu à l'avance. Aucun ajustement au cas par cas.",
                    ],
                    [
                      "03",
                      "Dix avis minimum",
                      "En dessous, la note reste indicative et n'entre pas dans les classements.",
                    ],
                  ].map(([n, title, desc]) => (
                    <li key={n} className="flex gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 font-mono text-xs font-bold text-accent">
                        {n}
                      </span>
                      <div>
                        <h3 className="font-bold text-ink">{title}</h3>
                        <p className="mt-0.5 text-sm leading-relaxed text-soft">
                          {desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/methode"
                  className="mt-8 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
                >
                  Voir la méthodologie complète
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div>
                <div className="rounded-2xl border border-line bg-paper p-6 shadow-card sm:p-7">
                  <div className="flex items-center justify-between border-b border-dashed border-line-strong pb-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                        Fiche de calcul
                      </p>
                      <p className="mt-0.5 font-bold text-ink">
                        Comment lire une note
                      </p>
                    </div>
                    <span className="rounded-sm bg-accent/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase text-accent">
                      Indice
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      ["Ambiance et relations", "20 %", "4/5", "0,80"],
                      ["Management", "15 %", "3/5", "0,45"],
                      ["Rémunération", "15 %", "4/5", "0,60"],
                    ].map(([label, weight, note, contribution]) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="min-w-0 flex-1 truncate text-sm text-soft">
                          {label}
                        </span>
                        <span className="rounded-sm bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">
                          {weight}
                        </span>
                        <span className="w-8 text-right font-mono text-xs tabular text-ink">
                          {note}
                        </span>
                        <span className="w-10 text-right font-mono text-xs font-bold tabular text-ink">
                          {contribution}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 text-muted">
                      <span className="min-w-0 flex-1 truncate text-sm">
                        + 6 autres critères
                      </span>
                      <span className="rounded-sm bg-surface px-2 py-0.5 font-mono text-[10px]">
                        50 %
                      </span>
                      <span className="w-8 text-right font-mono text-xs">
                        —
                      </span>
                      <span className="w-10 text-right font-mono text-xs font-bold tabular">
                        1,80
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-line-strong pt-4 text-sm">
                    <span className="text-soft">Moyenne pondérée</span>
                    <span className="font-mono font-bold tabular text-ink">
                      3,65 <span className="font-normal text-muted">/5</span>
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
                        Indice final
                      </p>
                      <p className="font-mono text-5xl font-bold leading-none tabular text-accent">
                        73
                        <span className="text-base font-normal text-muted">
                          /100
                        </span>
                      </p>
                    </div>
                    <Link
                      href="/methode#exemple"
                      className="text-sm font-semibold text-accent transition hover:text-accent-deep"
                    >
                      Voir le calcul →
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl bg-accent-deep px-5 py-4 text-paper">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal font-bold text-ink">
                    ✓
                  </span>
                  <p className="text-sm leading-relaxed text-paper/85">
                    La note n&apos;est pas une opinion : c&apos;est une formule
                    publique, applicable par tous.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* LES MIEUX NOTÉES */}
      {topCompanies.length > 0 ? (
        <section className="bg-surface">
          <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                    Palmarès
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                    Les mieux notées
                  </h2>
                </div>
                <Link
                  href="/classements"
                  className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink"
                >
                  Classement complet →
                </Link>
              </div>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topCompanies.map((c, i) => (
                <Reveal key={c.id} delay={i * 80}>
                  <CompanyCard company={{ ...c, rank: i + 1 }} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* EXPLORER */}
      <section className="relative overflow-hidden bg-accent-deep text-paper">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 60% at 90% 0%, rgba(20,184,166,0.22), transparent 70%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">
                  Explorer
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Parcourir le registre
                </h2>
                <p className="mt-2 max-w-lg text-paper/70">
                  Entrez par ce qui compte pour vous : votre métier ou votre
                  ville.
                </p>
              </div>
              <Link
                href="/entreprises"
                className="rounded-lg bg-paper px-4 py-2 text-sm font-semibold text-accent-deep transition hover:bg-white"
              >
                Annuaire complet →
              </Link>
            </div>
          </Reveal>

          {cityList.length > 0 ? (
            <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cityList.slice(0, 3).map((c, i) => (
                <Reveal key={c.name} delay={i * 70}>
                  <Link
                    href={`/entreprises?city=${encodeURIComponent(c.name)}`}
                    className="group relative block aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-white/10"
                  >
                    <img
                      src={companyCover(c.name)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/35 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal">
                          Ville
                        </p>
                        <p className="text-xl font-bold leading-tight">
                          {c.name}
                        </p>
                        <p className="text-xs text-paper/70">
                          {c.count} {c.count > 1 ? "entreprises" : "entreprise"}
                        </p>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition group-hover:bg-paper group-hover:text-ink">
                        →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : null}

          <Reveal delay={120}>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold">Par secteur</h3>
                <Link
                  href="/entreprises"
                  className="text-sm font-semibold text-teal transition hover:text-paper"
                >
                  Tous les secteurs →
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {sectorList.map((s) => (
                  <Link
                    key={s.name}
                    href={`/entreprises?sector=${encodeURIComponent(s.name)}`}
                    className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-paper/85 transition hover:border-teal hover:text-teal"
                  >
                    {s.name}
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-paper/60 transition group-hover:text-teal">
                      {s.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ENTREPRISES — index avec vignettes */}
      <section className="bg-paper">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  Le registre
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Toutes les entreprises
                </h2>
              </div>
              <Link
                href="/entreprises"
                className="text-sm font-semibold text-accent transition hover:text-accent-deep"
              >
                Tout voir →
              </Link>
            </div>
          </Reveal>

          {companies.length === 0 ? (
            <p className="mt-8 text-muted">Aucune entreprise référencée.</p>
          ) : (
            <div className="mt-8">
              <CompanyCarousel companies={companies} />
            </div>
          )}
        </div>
      </section>

      {/* TÉMOIGNAGES — carrousel */}
      {reviewSlides.length > 0 ? (
        <section className="bg-surface">
          <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
            <Reveal>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  Avis vérifiés
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Derniers avis
                </h2>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-8">
                <ReviewCarousel reviews={reviewSlides} />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* CONFIANCE — bande photo */}
      <section className="relative overflow-hidden">
        <img
          src={PHOTOS.trust}
          alt="Poignée de main professionnelle"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/45" />
        <div className="relative mx-auto w-full max-w-7xl px-6 py-16 text-paper sm:py-20">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">
              Nos garanties
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pourquoi vous pouvez nous faire confiance
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              ["Avis vérifiés", "Un contributeur peut prouver son lien avec l'entreprise. Les avis vérifiés sont clairement distingués."],
              ["Anonymat protégé", "Publiez anonymement, sous pseudonyme ou à visage découvert. Votre identité n'est jamais révélée sans accord."],
              ["Droit de réponse", "Les entreprises répondent aux avis, mais ne peuvent jamais supprimer ou déclasser un avis négatif."],
            ].map(([title, desc], i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="border-t border-white/25 pt-4">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper/80">
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img
          src={PHOTOS.city}
          alt="Immeubles de bureaux"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/40" />
        <div className="relative mx-auto w-full max-w-7xl px-6 py-20">
          <Reveal>
            <div className="max-w-xl text-paper">
              <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                Votre expérience vaut de l&apos;or.
              </h2>
              <p className="mt-4 text-lg text-paper/85">
                Partagez-la en quelques minutes et aidez des milliers de
                candidats à choisir en connaissance de cause.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/deposer-avis"
                  className="rounded-lg bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-amber"
                >
                  Déposer un avis
                </Link>
                <Link
                  href="/proposer-entreprise"
                  className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-paper transition hover:bg-white/10"
                >
                  Proposer une entreprise
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
