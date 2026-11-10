import Image from "next/image";
import Link from "next/link";
import { getCompaniesWithScore } from "@/lib/companies";
import { getHomeStats, getLatestReviews } from "@/lib/home-data";
import { CRITERIA, computeGlobalScore, scoreToFloatStars } from "@/lib/rating";
import { PHOTOS, companyCover } from "@/lib/images";
import { CompanyCard } from "@/components/CompanyCard";
import { Stars } from "@/components/Stars";
import { CompanyCarousel } from "@/components/CompanyCarousel";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { Reveal } from "@/components/Reveal";
import { TypingReview } from "@/components/TypingReview";

export default async function Home() {
  const [
    companies,
    latestReviews,
    { companyCount, reviewCount, userCount, sectorList, cityList },
  ] = await Promise.all([
    getCompaniesWithScore(),
    getLatestReviews(),
    getHomeStats(),
  ]);

  const topCompanies = companies
    .filter((c) => c.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);

  const featuredCompany = topCompanies[0] ?? null;

  const heroQuote = (() => {
    const review = latestReviews.find(
      (item) =>
        item.comment?.trim() ||
        item.positives?.trim() ||
        item.negatives?.trim(),
    );
    if (!review) return null;

    const raw = (
      review.comment ??
      review.positives ??
      review.negatives ??
      ""
    ).trim();

    return {
      text: raw.length > 120 ? `${raw.slice(0, 117).trimEnd()}…` : raw,
      company: review.company.name,
      slug: review.company.slug,
      score: computeGlobalScore(review.ratings),
    };
  })();

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

  const heroReviews = latestReviews
    .flatMap((review) => {
      const meta = { company: review.company.name, jobTitle: review.jobTitle };
      return [review.positives, review.negatives, review.comment]
        .filter((text): text is string => Boolean(text?.trim()))
        .map((text) => ({ ...meta, text }));
    })
    .slice(0, 6);

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
      title: "Publication immédiate",
      desc: "Votre avis est publié dès l'envoi. Notre équipe peut le retirer s'il enfreint les règles, et chaque signalement est examiné.",
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[calc(100svh-65px)] flex-col overflow-hidden bg-ink text-paper">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 55% at 85% 0%, rgba(20,184,166,0.1), transparent 70%), radial-gradient(40% 50% at 0% 100%, rgba(232,146,12,0.08), transparent 70%)",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-12 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-10">
          <div>
            <p
              className="animate-fade-up flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-teal"
              style={{ animationDelay: "0ms" }}
            >
              Registre indépendant
              <span className="hidden sm:inline"> · Côte d&apos;Ivoire</span>
            </p>

            <h1
              className="animate-fade-up mt-5 text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-[clamp(3.25rem,7.2vh,4.5rem)]"
              style={{ animationDelay: "80ms" }}
            >
              Des avis de salariés
              <span className="mt-1 block text-teal">
                sur les employeurs ivoiriens.
              </span>
            </h1>

            <p
              className="animate-fade-up mt-5 max-w-lg text-lg leading-relaxed text-paper/75"
              style={{ animationDelay: "160ms" }}
            >
              Des expériences de travail réelles, anonymes ou nominatives, pour
              savoir dans quoi vous vous engagez avant de signer.
            </p>

            <form
              action="/entreprises"
              method="GET"
              className="animate-fade-up mt-6 flex max-w-lg items-center gap-1.5 rounded-xl bg-surface p-1.5 shadow-lift"
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
              className="animate-fade-up mt-3 flex flex-wrap items-center gap-2 text-xs text-paper/55"
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

            <div
              className="animate-fade-up"
              style={{ animationDelay: "360ms" }}
            >
              <TypingReview reviews={heroReviews} />
            </div>
          </div>

          {/* Collage de cartes */}
          <div className="relative">
            <div className="relative mx-auto h-[30rem] w-full max-w-sm sm:h-[32rem] sm:max-w-lg lg:h-[34rem] lg:max-w-xl">
              <div className="absolute left-0 top-1/2 z-10 w-[60%] -translate-y-1/2 lg:w-[62%]">
                <div className="relative">
                  <div className="relative z-10 ml-0 w-[92%] -rotate-[3deg] overflow-hidden rounded-xl border border-white/15 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.75)]">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={PHOTOS.hero}
                        alt="Deux collègues échangeant devant un ordinateur"
                        fill
                        preload
                        sizes="(max-width: 1024px) 60vw, 600px"
                        className="object-cover object-[center_40%]"
                      />
                    </div>
                  </div>

                  <div className="relative z-20 ml-auto -mt-12 w-[92%] rotate-[2deg] overflow-hidden rounded-xl border border-white/15 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.75)]">
                    <div className="relative aspect-[2/1]">
                      <Image
                        src={PHOTOS.mission}
                        alt="Équipe en réunion dans un bureau"
                        fill
                        sizes="(max-width: 1024px) 60vw, 600px"
                        className="object-cover object-[center_35%]"
                      />
                    </div>
                  </div>

                  <div className="relative z-30 ml-0 -mt-12 w-[92%] -rotate-[2deg] overflow-hidden rounded-xl border border-white/15 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.75)]">
                    <div className="relative aspect-[2/1]">
                      <Image
                        src={PHOTOS.trust}
                        alt="Poignée de main entre deux professionnels"
                        fill
                        sizes="(max-width: 1024px) 60vw, 600px"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="relative z-40 ml-auto -mt-12 w-[92%] rotate-[3deg] overflow-hidden rounded-xl border border-white/15 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.75)]">
                    <div className="relative aspect-[2/1]">
                      <Image
                        src={PHOTOS.city}
                        alt="Vue d'une ville d'affaires"
                        fill
                        sizes="(max-width: 1024px) 60vw, 600px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute right-0 top-0 z-20 flex h-full w-[38%] flex-col justify-between py-2 lg:w-[34%]">
                {featuredCompany ? (
                  <Link
                    href={`/entreprises/${featuredCompany.slug ?? featuredCompany.id}`}
                    className="block rotate-[2deg] rounded-xl bg-surface p-4 text-ink shadow-[0_14px_32px_-22px_rgba(0,0,0,0.65)] transition-colors hover:bg-white"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                      Indice NEVALO
                    </p>
                    <p className="mt-1 font-mono text-4xl font-bold leading-none tabular text-accent">
                      {featuredCompany.score ?? 0}
                      <span className="text-sm font-normal text-muted">/100</span>
                    </p>
                    <div className="mt-2">
                      <Stars
                        value={scoreToFloatStars(featuredCompany.score ?? 0)}
                        size="text-xs"
                      />
                    </div>
                    <p className="mt-3 border-t border-line pt-2 text-[11px] text-muted">
                      {featuredCompany.name} · {featuredCompany.reviewCount} avis
                    </p>
                  </Link>
                ) : null}

                {heroQuote ? (
                  <Link
                    href={
                      heroQuote.slug
                        ? `/entreprises/${heroQuote.slug}`
                        : "/entreprises"
                    }
                    className="block -rotate-[2deg] rounded-lg bg-paper px-4 py-3 text-ink shadow-[0_14px_32px_-22px_rgba(0,0,0,0.65)] transition-colors hover:bg-white"
                  >
                    <p className="text-xs font-semibold leading-snug">
                      « {heroQuote.text} »
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase text-muted">
                      {heroQuote.company} · {heroQuote.score}/100
                    </p>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-6 py-3 sm:grid-cols-4">
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
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
              <Image
                src={PHOTOS.howItWorks}
                alt="Une équipe collaborant autour d'un ordinateur"
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
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
                      "En dessous, la note reste indicative et n'entre pas dans le classement complet.",
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
                <div className="relative -rotate-1">
                  <div className="relative overflow-hidden rounded-lg border border-line-strong bg-note shadow-card">
                    <div
                      aria-hidden
                      className="absolute inset-y-0 left-12 w-px bg-amber/50"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-12 border-r border-line-strong/70"
                    >
                      <div className="flex h-full flex-col items-center justify-around py-5">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <span
                            key={i}
                            className="h-1.5 w-7 rounded-full border border-line-strong bg-surface"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="relative pl-16 pr-6 py-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-hand text-2xl leading-none text-ink">
                            Fiche de calcul
                          </p>
                          <p className="mt-1 font-hand text-base leading-none text-muted">
                            Les 9 critères et leur poids
                          </p>
                        </div>
                        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                          NEVALO
                        </span>
                      </div>

                      <ul className="mt-4">
                        {CRITERIA.map(({ key, label, weight }) => (
                          <li
                            key={key}
                            className="flex items-baseline justify-between gap-3 border-b border-line py-2 font-hand text-xl leading-7 text-ink/90 sm:text-2xl sm:leading-8"
                          >
                            <span>{label}</span>
                            <span className="shrink-0 text-accent-deep">
                              {weight}%
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 flex items-end justify-between gap-4">
                        <p className="font-hand text-lg leading-6 text-soft">
                          Moyenne pondérée{" "}
                          <span className="text-ink">3,65/5</span>
                        </p>
                        <p className="font-hand text-4xl leading-none text-accent-deep">
                          73
                          <span className="text-lg text-muted">/100</span>
                        </p>
                      </div>

                      <Link
                        href="/methode#exemple"
                        className="relative mt-3 inline-block pb-2 font-hand text-xl text-accent-deep transition hover:text-accent sm:text-2xl"
                      >
                        Voir le calcul détaillé →
                        <svg
                          viewBox="0 0 220 10"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-2 w-full text-accent-deep/70"
                        >
                          <path
                            d="M2 3 C30 2, 55 4, 90 3 S150 2, 218 4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                          />
                          <path
                            d="M6 7 C40 6, 75 8, 110 7 S175 6, 214 8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                            opacity="0.7"
                          />
                        </svg>
                      </Link>
                    </div>
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
                    className="group relative block aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10"
                  >
                    <Image
                      src={companyCover(c.name)}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
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
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-5">
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
                  Retours d&apos;expérience
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
        <Image
          src={PHOTOS.trust}
          alt="Poignée de main professionnelle"
          fill
          sizes="100vw"
          className="object-cover"
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
              ["Statut affiché", "Chaque avis indique s'il a été vérifié ou non. La mention « vérifié » repose sur un justificatif de lien avec l'entreprise."],
              ["Anonymat protégé", "Publiez anonymement, sous pseudonyme ou à visage découvert. Votre identité n'est jamais révélée sans accord."],
              ["Droit de réponse", "Les entreprises peuvent demander à publier une réponse, sans jamais supprimer ou déclasser un avis négatif."],
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
        <Image
          src={PHOTOS.city}
          alt="Immeubles de bureaux"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/40" />
        <div className="relative mx-auto w-full max-w-7xl px-6 py-20">
          <Reveal>
            <div className="max-w-xl text-paper">
              <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                Votre expérience vaut de l&apos;or.
              </h2>
              <p className="mt-4 text-lg text-paper/85">
                Partagez-la en quelques minutes et aidez d&apos;autres candidats
                à choisir en connaissance de cause.
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
