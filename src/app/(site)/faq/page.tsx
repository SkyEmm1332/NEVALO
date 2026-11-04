import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "FAQ · NEVALO",
};

const GROUPS = [
  {
    id: "compte",
    label: "Compte & général",
    items: [
      {
        q: "Nevalo est-il gratuit ?",
        a: "Oui. La consultation des entreprises, la lecture des avis et le dépôt d'avis sont entièrement gratuits pour les candidats et les salariés.",
      },
      {
        q: "Faut-il un compte pour lire les avis ?",
        a: "Non. Tous les avis publiés sont consultables sans compte. Un compte est nécessaire uniquement pour déposer un avis, suivre vos contributions ou gérer vos données.",
      },
      {
        q: "Puis-je proposer une entreprise absente du registre ?",
        a: "Oui. Utilisez la page « Proposer une entreprise ». Après vérification, elle sera ajoutée au registre et pourra recevoir des avis.",
      },
    ],
  },
  {
    id: "avis",
    label: "Avis & anonymat",
    items: [
      {
        q: "Mon avis est-il vraiment anonyme ?",
        a: "Vous choisissez votre niveau de visibilité : anonyme, pseudonyme ou à visage découvert. Votre identité n'est jamais révélée publiquement sans votre accord, et votre adresse email n'est jamais affichée.",
      },
      {
        q: "Comment faire vérifier mon avis ?",
        a: "Depuis votre espace, vous pouvez téléverser un justificatif de lien avec l'entreprise (contrat, bulletin de paie, attestation). Une fois validé, votre avis porte la mention « vérifié ».",
      },
      {
        q: "Puis-je modifier ou supprimer mon avis ?",
        a: "Oui, depuis votre espace vous pouvez modifier un avis tant qu'il n'a pas été modéré, et demander sa suppression à tout moment.",
      },
    ],
  },
  {
    id: "notes",
    label: "Notes & méthode",
    items: [
      {
        q: "Comment la note est-elle calculée ?",
        a: "Chaque avis note 9 critères sur 5. La note NEVALO est un indice sur 100 obtenu en pondérant ces critères. Le détail complet, avec un exemple de calcul, est disponible sur la page Méthodologie.",
      },
      {
        q: "Pourquoi certaines entreprises n'ont-elles pas de note ?",
        a: "Une entreprise sans avis publié n'est pas évaluée. En dessous de 10 avis, la note est indicative ; elle n'entre dans les classements qu'à partir de 10 avis.",
      },
      {
        q: "Les avis anciens comptent-ils autant ?",
        a: "Non. Les expériences récentes pèsent davantage : une expérience de moins de 12 mois a plus d'impact sur la note qu'un avis de plusieurs années.",
      },
    ],
  },
  {
    id: "entreprises",
    label: "Entreprises & modération",
    items: [
      {
        q: "Une entreprise peut-elle faire supprimer un avis négatif ?",
        a: "Non. Une entreprise peut signaler un avis qu'elle juge contraire aux règles (propos haineux, données personnelles, diffamation) et exercer un droit de réponse. Mais elle ne peut jamais supprimer un avis simplement parce qu'il est négatif.",
      },
      {
        q: "Comment signaler un contenu problématique ?",
        a: "Depuis la fiche de l'entreprise concernée, chaque avis dispose d'un bouton de signalement. Notre équipe de modération examine chaque signalement.",
      },
      {
        q: "Comment une entreprise peut-elle revendiquer sa fiche ?",
        a: "Une entreprise peut demander à revendiquer sa fiche pour répondre aux avis et mettre à jour ses informations. La démarche se fait via la page Contact.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Registre · Aide"
        title="Questions fréquentes"
        description="Tout ce qu'il faut savoir sur le fonctionnement de Nevalo : compte, anonymat, calcul des notes et modération."
        stats={[
          { value: "4", label: "thématiques" },
          { value: "12", label: "réponses détaillées" },
          { value: "48 h", label: "délai support" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          {/* Sommaire */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Sommaire
            </p>
            <nav className="mt-3 space-y-1">
              {GROUPS.map((g, i) => (
                <a
                  key={g.id}
                  href={`#${g.id}`}
                  className="flex items-baseline gap-3 border-l-2 border-line py-1.5 pl-3 text-sm text-soft transition hover:border-accent hover:text-accent"
                >
                  <span className="font-mono text-[11px] text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {g.label}
                </a>
              ))}
            </nav>

            <div className="mt-6 border border-line bg-surface p-5">
              <p className="font-semibold text-ink">Une autre question ?</p>
              <p className="mt-1 text-sm text-soft">
                Notre équipe répond sous 48 h ouvrées.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-block border border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-soft"
              >
                Nous contacter
              </Link>
            </div>
          </aside>

          {/* Questions */}
          <div className="space-y-14">
            {GROUPS.map((g) => (
              <Reveal key={g.id}>
                <section id={g.id} className="scroll-mt-24">
                  <div className="border-b border-line pb-2">
                    <h2 className="text-2xl font-extrabold tracking-tight text-ink">
                      {g.label}
                    </h2>
                  </div>
                  <div className="mt-4 divide-y divide-line border border-line bg-surface">
                    {g.items.map((item) => (
                      <details key={item.q} className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-ink transition hover:text-accent">
                          <span>{item.q}</span>
                          <span className="font-mono text-accent transition group-open:rotate-45">
                            +
                          </span>
                        </summary>
                        <p className="px-5 pb-5 text-sm leading-relaxed text-soft">
                          {item.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
