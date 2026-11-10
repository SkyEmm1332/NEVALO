import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Mentions légales · NEVALO",
};

const SECTIONS = [
  {
    id: "editeur",
    title: "1. Éditeur du site",
    body: [
      "Nevalo est une plateforme d'évaluation d'entreprises éditée en Côte d'Ivoire. Adresse de contact : contact@nevalo.ci. Directeur de la publication : l'équipe Nevalo.",
      "Le site est hébergé sur une infrastructure cloud sécurisée. Les coordonnées de l'hébergeur peuvent être obtenues sur demande à contact@nevalo.ci.",
    ],
  },
  {
    id: "donnees",
    title: "2. Données personnelles",
    body: [
      "Nevalo collecte les données strictement nécessaires au fonctionnement du service : identité de compte, adresse email, avis et justificatifs de vérification. Les avis peuvent être publiés de manière anonyme ou pseudonyme. Aucune donnée personnelle n'est vendue à des tiers.",
      "Conformément à la réglementation applicable, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer, écrivez à contact@nevalo.ci.",
    ],
  },
  {
    id: "cookies",
    title: "3. Cookies",
    body: [
      "Nevalo utilise uniquement les cookies nécessaires au fonctionnement du service (session de connexion, préférences). Aucun cookie publicitaire tiers n'est déposé sans consentement explicite.",
    ],
  },
  {
    id: "cgu",
    title: "4. Conditions d'utilisation",
    body: [
      "Les contributeurs s'engagent à publier des avis fondés sur une expérience de travail réelle et à ne pas diffuser de propos haineux, diffamatoires, ni de données personnelles concernant des tiers. Nevalo se réserve le droit de modérer, refuser ou retirer tout contenu contraire à ces règles.",
      "L'utilisation du service implique l'acceptation pleine et entière des présentes conditions.",
    ],
  },
  {
    id: "droit-reponse",
    title: "5. Droit de réponse des entreprises",
    body: [
      "Toute entreprise référencée peut demander l'ouverture d'un droit de réponse sur les avis la concernant. Le droit de réponse est publié sans modification du contenu initial de l'avis. Une entreprise ne peut jamais supprimer un avis au seul motif qu'il est négatif.",
    ],
  },
  {
    id: "propriete",
    title: "6. Propriété intellectuelle",
    body: [
      "Les contenus publiés par les contributeurs restent leur propriété. En publiant un avis, ils accordent à Nevalo une licence non exclusive d'affichage sur la plateforme. La marque, le nom et les éléments graphiques de Nevalo sont protégés.",
    ],
  },
  {
    id: "responsabilite",
    title: "7. Responsabilité",
    body: [
      "Les avis reflètent l'expérience personnelle de leurs auteurs et n'engagent pas la responsabilité éditoriale de Nevalo. Nevalo met en œuvre les moyens raisonnables pour vérifier et modérer les contenus, sans garantie d'exhaustivité.",
    ],
  },
];

export default function LegalPage() {
  return (
    <>
      <PageHero
        eyebrow="Registre · Cadre légal"
        title="Mentions légales"
        description="Éditeur, données personnelles, conditions d'utilisation et droit de réponse : l'ensemble du cadre applicable à Nevalo."
        stats={[
          { value: "7", label: "rubriques" },
          { value: "2026", label: "mise à jour" },
          { value: "CI", label: "droit applicable" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          {/* Sommaire */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-line bg-surface p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                Sommaire
              </p>
              <nav className="mt-3 space-y-1">
                {SECTIONS.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-baseline gap-3 border-l-2 border-line py-1.5 pl-3 text-sm text-soft transition hover:border-accent hover:text-accent"
                  >
                    <span className="font-mono text-[11px] text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.title.replace(/^\d+\\.\\s*/, "")}
                  </a>
                ))}
              </nav>
            </div>
            <p className="mt-4 px-1 font-mono text-xs text-muted">
              Dernière mise à jour : janvier 2026
            </p>
          </aside>

          {/* Contenu */}
          <div className="space-y-12">
            {SECTIONS.map((s) => (
              <Reveal key={s.id}>
                <section id={s.id} className="scroll-mt-24">
                  <div className="border-b border-line pb-2">
                    <h2 className="text-xl font-extrabold tracking-tight text-ink">
                      {s.title}
                    </h2>
                  </div>
                  {s.body.map((p) => (
                    <p key={p} className="mt-3 leading-relaxed text-soft">
                      {p}
                    </p>
                  ))}
                </section>
              </Reveal>
            ))}

            <Reveal>
              <div className="border border-line bg-surface p-6">
                <p className="font-semibold text-ink">
                  Une question juridique ou une demande de retrait ?
                </p>
                <p className="mt-1 text-sm text-soft">
                  Écrivez-nous à contact@nevalo.ci — les demandes sont traitées
                  par email.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
