import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
import { PHOTOS } from "@/lib/images";

export const metadata = {
  title: "À propos · NEVALO",
};

const VALUES = [
  {
    dot: "bg-accent",
    title: "Indépendance",
    desc: "Nous ne sommes financés ni par les entreprises évaluées, ni par la vente de positions dans les classements. La note ne s'achète pas.",
  },
  {
    dot: "bg-blue",
    title: "Transparence",
    desc: "Notre méthode de calcul et nos règles de modération sont publiques. Chacun peut comprendre d'où vient une note.",
  },
  {
    dot: "bg-gold",
    title: "Protection",
    desc: "L'anonymat des contributeurs est un principe non négociable. Aucune identité n'est révélée sans consentement.",
  },
];

const TIMELINE = [
  {
    year: "Le constat",
    title: "Choisir un employeur à l'aveugle",
    desc: "Les candidats signent sur la base d'une promesse d'entretien. Les réalités du quotidien — management, charge, ambiance — restent invisibles.",
  },
  {
    year: "L'approche",
    title: "Structurer la parole des salariés",
    desc: "Plutôt que des avis isolés, un référentiel commun : 9 critères notés, une note sur 100, des avis vérifiables et comparables.",
  },
  {
    year: "Le registre",
    title: "Un bien commun, ouvert",
    desc: "Nevalo agrège ces expériences en un registre public, gratuit pour les candidats, pensé pour le marché ivoirien.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Registre · Qui sommes-nous"
        title="À propos de Nevalo"
        description="Un registre indépendant de la transparence professionnelle, fondé sur des expériences de travail réelles plutôt que sur des promesses de recrutement."
        stats={[
          { value: "9", label: "critères évalués" },
          { value: "/100", label: "indice de note" },
          { value: "0", label: "classement sponsorisé" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
        {/* MISSION */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <img
                src={PHOTOS.mission}
                alt="Une équipe réunie autour d'une table de travail"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                Notre mission
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Rendre le marché du travail lisible
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-soft">
                <p>
                  La décision d&apos;accepter un poste se prend trop souvent à
                  l&apos;aveugle. Les offres décrivent un employeur idéal,
                  rarement le quotidien réel.
                </p>
                <p>
                  Nous centralisons des avis anonymes, vérifiés et structurés,
                  pour que chacun sache vraiment dans quoi il s&apos;engage avant
                  de signer.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-line bg-surface p-5">
                  <div className="font-mono text-2xl font-bold tabular text-accent">
                    48 h
                  </div>
                  <p className="mt-1 text-xs text-muted">Réponse support</p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-5">
                  <div className="font-mono text-2xl font-bold tabular text-gold">
                    Abidjan
                  </div>
                  <p className="mt-1 text-xs text-muted">Ancrage ivoirien</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* VALEURS */}
        <Reveal>
          <div className="mt-20 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                Nos principes
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Ce qui nous tient
              </h2>
            </div>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 70}>
              <div className="h-full rounded-xl border border-line bg-surface p-6">
                <span className={`inline-block h-3 w-3 rounded-full ${v.dot}`} />
                <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-soft">
                  {v.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* DÉMARCHE */}
        <Reveal>
          <div className="mt-20">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Notre trajectoire
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Du constat au registre
            </h2>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.year} delay={i * 70}>
              <div className="relative h-full border-t-2 border-ink pt-5">
                <span className="font-mono text-xs uppercase tracking-widest text-accent">
                  {t.year}
                </span>
                <h3 className="mt-2 text-lg font-bold tracking-tight text-ink">
                  {t.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-soft">
                  {t.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* MODÈLE */}
        <Reveal>
          <div className="mt-20 overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-48">
                <img
                  src={PHOTOS.trust}
                  alt="Poignée de main professionnelle"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="p-7">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  Modèle économique
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
                  Gratuit, et fier de l&apos;être
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-soft">
                  Nevalo est gratuit pour les candidats et les salariés.
                </p>
                <ul className="mt-4 space-y-2.5">
                  {[
                    "Aucune entreprise ne peut acheter une meilleure note.",
                    "Aucun avis négatif n'est retiré sur simple demande.",
                    "Toute évolution du modèle sera annoncée publiquement.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-soft">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-[11px] font-bold text-accent">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-2xl bg-accent-deep p-8 text-paper sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Envie de contribuer au registre ?
              </h2>
              <p className="mt-1 text-paper/80">
                Un avis prend quelques minutes et aide des milliers de candidats.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/methode"
                className="rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10"
              >
                Méthodologie
              </Link>
              <Link
                href="/deposer-avis"
                className="rounded-lg bg-paper px-5 py-2.5 text-sm font-semibold text-accent-deep transition hover:bg-white"
              >
                Déposer un avis
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
