import Link from "next/link";
import { CRITERIA } from "@/lib/rating";
import { PHOTOS } from "@/lib/images";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
import { Stars } from "@/components/Stars";

export const metadata = {
  title: "Méthodologie · NEVALO",
};

const EXAMPLE = [
  { label: "Ambiance et relations", score: 4, weight: 20 },
  { label: "Management", score: 3, weight: 15 },
  { label: "Rémunération", score: 4, weight: 15 },
  { label: "Évolution professionnelle", score: 3, weight: 15 },
  { label: "Charge de travail", score: 4, weight: 10 },
  { label: "Équilibre vie pro / perso", score: 3, weight: 10 },
  { label: "Reconnaissance", score: 4, weight: 5 },
  { label: "Conditions de travail", score: 4, weight: 5 },
  { label: "Stabilité professionnelle", score: 5, weight: 5 },
];

export default function MethodPage() {
  const weighted = EXAMPLE.reduce((sum, e) => sum + e.score * (e.weight / 100), 0);
  const finalScore = Math.round(weighted * 20);

  return (
    <>
      <PageHero
        eyebrow="Registre · Méthodologie"
        title="Comment est calculée la note"
        description="La note NEVALO est un indice sur 100, construit à partir des notes sur 5 laissées par les salariés. Chaque critère est pondéré selon son importance dans l'expérience de travail."
        stats={[
          { value: "9", label: "critères pondérés" },
          { value: "×20", label: "conversion sur 100" },
          { value: "10+", label: "avis pour être classable" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
        {/* CRITÈRES */}
        <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                Le référentiel
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Les 9 critères et leur poids
              </h2>
              <p className="mt-3 max-w-lg leading-relaxed text-soft">
                Chaque critère contribue à la note globale à hauteur de son
                poids. L&apos;ambiance et le management pèsent le plus.
              </p>

              <ol className="mt-7 border-t border-line">
                {CRITERIA.map(({ key, label, weight }, i) => (
                  <li
                    key={key}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line py-3.5 md:grid-cols-[36px_1fr_auto_auto] md:gap-6"
                  >
                    <span className="font-mono text-xs text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium text-ink">{label}</span>
                    <div className="hidden h-1.5 w-28 rounded-full bg-paper md:block">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-accent to-teal"
                        style={{ width: `${(weight / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-right font-mono font-bold tabular text-ink">
                      {weight}%
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="space-y-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <img
                  src={PHOTOS.methodology}
                  alt="Atelier de travail avec des notes sur un tableau"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="rounded-xl bg-accent-deep p-6 text-paper">
                <h3 className="text-lg font-bold">De l&apos;avis à la note</h3>
                <ol className="mt-3 space-y-2 text-sm text-paper/85">
                  {[
                    "Les 9 critères sont notés sur 5 étoiles.",
                    "Chaque note est multipliée par son poids.",
                    "Le total est ramené sur 100.",
                    "Les avis récents pèsent davantage.",
                  ].map((step) => (
                    <li key={step} className="flex gap-2">
                      <span className="text-teal">→</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        </div>

        {/* SEUILS */}
        <Reveal>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["bg-slate-300", "0 avis", "Non évaluée", "Aucune note attribuée."],
              ["bg-blue", "1 à 4 avis", "Indicative", "À prendre avec recul."],
              ["bg-gold", "5 à 9 avis", "Limitée", "Signal utile mais partiel."],
              ["bg-teal", "10 avis et +", "Classable", "Entre dans les classements."],
            ].map(([c, n, t, d]) => (
              <div key={n} className="rounded-xl border border-line bg-surface p-5">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${c}`} />
                  <span className="font-mono text-xs text-muted">{n}</span>
                </div>
                <p className="mt-2 font-bold text-ink">{t}</p>
                <p className="mt-1 text-sm text-soft">{d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* EXEMPLE */}
        <div id="exemple" className="mt-20 scroll-mt-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  Démonstration
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Exemple de calcul
                </h2>
                <p className="mt-2 max-w-lg leading-relaxed text-soft">
                  Un même avis, critère par critère, jusqu&apos;à la note finale.
                </p>
              </div>
              <span className="rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[11px] text-muted">
                Exemple · Avis complet
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="grid border-b border-line sm:grid-cols-3">
                {[
                  ["1", "Notez", "Chaque critère est noté sur 5 étoiles."],
                  [
                    "2",
                    "Pondérez",
                    "La note est multipliée par le poids du critère.",
                  ],
                  [
                    "3",
                    "Convertissez",
                    "La moyenne sur 5 est ramenée sur 100 (×20).",
                  ],
                ].map(([n, title, desc], i) => (
                  <div
                    key={n}
                    className={`flex gap-3 p-4 ${
                      i > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-xs font-bold text-accent">
                      {n}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-soft">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-[1.4fr_0.6fr]">
                <div className="p-5 sm:p-6">
                  <div className="hidden items-center gap-3 border-b border-line pb-2 font-mono text-[10px] uppercase tracking-wide text-muted sm:flex">
                    <span className="flex-1">Critère</span>
                    <span className="w-24 text-center">Note</span>
                    <span className="w-12 text-center">Poids</span>
                    <span className="w-14 text-right">Contribution</span>
                  </div>

                  <div className="divide-y divide-line">
                    {EXAMPLE.map((e) => (
                      <div key={e.label} className="flex items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-soft">{e.label}</p>
                          <div className="mt-1 sm:hidden">
                            <Stars value={e.score} size="text-xs" />
                          </div>
                        </div>
                        <div className="hidden w-24 sm:block">
                          <Stars value={e.score} size="text-xs" />
                        </div>
                        <span className="hidden w-12 text-center font-mono text-xs text-muted sm:block">
                          {e.weight}%
                        </span>
                        <span className="w-14 text-right font-mono text-sm tabular text-ink">
                          {(e.score * (e.weight / 100)).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t-2 border-ink/10 pt-3">
                    <span className="text-sm font-semibold text-ink">
                      Total des contributions
                    </span>
                    <span className="font-mono text-lg font-bold tabular text-ink">
                      {weighted.toFixed(2).replace(".", ",")}
                      <span className="text-xs font-normal text-muted"> /5</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Contribution = note du critère × poids (ex. 4 × 20 % = 0,80).
                  </p>
                </div>

                <div className="flex flex-col justify-between gap-6 border-t border-line bg-accent-deep p-6 text-paper lg:border-l lg:border-t-0">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal">
                      Du /5 au /100
                    </p>
                    <div className="mt-4 rounded-xl bg-white/5 p-4 font-mono text-sm">
                      <p className="text-paper/60">Moyenne pondérée</p>
                      <p className="mt-1 text-2xl font-bold tabular">
                        {weighted.toFixed(2).replace(".", ",")}
                        <span className="text-sm font-normal text-paper/50">
                          {" "}
                          /5
                        </span>
                      </p>
                      <div className="my-3 border-t border-dashed border-white/20" />
                      <p className="text-paper/60">
                        {weighted.toFixed(2).replace(".", ",")} × 20
                      </p>
                      <p className="mt-1 flex items-baseline gap-2">
                        <span className="text-5xl font-bold tabular text-teal">
                          {finalScore}
                        </span>
                        <span className="text-sm text-paper/50">/100</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs leading-relaxed text-paper/60">
                      Pourquoi ×20 ? Les notes vont de 1 à 5 ; multiplier la
                      moyenne par 20 la ramène sur une échelle de 100.
                    </p>
                    <Link
                      href="/classements"
                      className="mt-4 inline-block text-sm font-semibold text-teal transition hover:text-paper"
                    >
                      Voir les classements →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* VÉRIFICATION */}
        <div className="mt-20">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Contrôle qualité
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Vérification & modération
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-soft">
              La note ne vaut que si les avis qui la composent sont fiables.
              Trois garde-fous.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              ["bg-accent", "Avis vérifiés", "Un contributeur peut prouver son lien avec l'entreprise (contrat, bulletin, attestation). Ces avis portent la mention « vérifié »."],
              ["bg-blue", "Modération humaine", "Chaque avis est relu avant publication : propos haineux, données personnelles et diffamation sont écartés."],
              ["bg-gold", "Droit de réponse", "Les entreprises peuvent répondre publiquement, mais jamais supprimer ou déclasser un avis négatif."],
            ].map(([c, title, desc], i) => (
              <Reveal key={title} delay={i * 70}>
                <div className="h-full rounded-xl border border-line bg-surface p-6">
                  <span className={`inline-block h-3 w-3 rounded-full ${c}`} />
                  <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-soft">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Reveal>
          <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-2xl bg-accent-deep p-8 text-paper sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Prêt à partager votre expérience ?
              </h2>
              <p className="mt-1 text-paper/80">
                Votre avis alimente directement le registre.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/faq"
                className="rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10"
              >
                Consulter la FAQ
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
