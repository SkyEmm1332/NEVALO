import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { PHOTOS } from "@/lib/images";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Registre · Assistance"
        title="Nous contacter"
        description="Une question, une demande de retrait, un signalement ou un partenariat ? Écrivez-nous — les messages sont traités par email."
        stats={[
          { value: "Email", label: "contact direct" },
          { value: "3", label: "types de demande" },
          { value: "Abidjan", label: "ancrage local" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Infos */}
          <div className="space-y-5">
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={PHOTOS.contact}
                  alt="Deux personnes échangeant dans un bureau"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            {[
              {
                color: "bg-accent",
                label: "Email",
                value: "contact@nevalo.ci",
                desc: "Questions générales, partenariats, presse.",
              },
              {
                color: "bg-gold",
                label: "Signalement",
                value: "Par email",
                desc: "Précisez l'entreprise et l'avis concerné.",
              },
              {
                color: "bg-blue",
                label: "Entreprises",
                value: "Par email",
                desc: "Écrivez-nous pour répondre aux avis et mettre à jour vos informations.",
              },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 80}>
                <div className="flex items-start gap-4 border border-line bg-surface p-5">
                  <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${c.color}`} />
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wide text-muted">
                      {c.label}
                    </p>
                    <p className="mt-1 font-semibold text-ink">{c.value}</p>
                    <p className="mt-0.5 text-sm text-soft">{c.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={240}>
              <div className="border-l-4 border-accent bg-surface p-5">
                <p className="font-semibold text-ink">Horaires</p>
                <p className="mt-1 text-sm text-soft">
                  Du lundi au vendredi, 8 h – 18 h (GMT). Les messages reçus hors
                  de ces horaires sont traités le jour ouvré suivant.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Formulaire */}
          <Reveal delay={100}>
            <ContactForm />
          </Reveal>
        </div>

        {/* Mini FAQ */}
        <Reveal>
          <div className="mt-16 border-b-2 border-ink pb-3">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight text-ink">
              Avant de nous écrire
            </h2>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Comment la note est-elle calculée ?", "Consultez la page Méthodologie pour le détail des 9 critères.", "/methode"],
            ["Mon avis est-il anonyme ?", "Oui, vous choisissez votre niveau de visibilité à chaque dépôt.", "/faq"],
            ["Une entreprise peut-elle retirer un avis ?", "Non, elle peut seulement répondre ou signaler un contenu contraire aux règles.", "/faq"],
          ].map(([q, a, href], i) => (
            <Reveal key={q} delay={i * 80}>
              <Link
                href={href}
                className="block h-full border border-line bg-surface p-5 transition-colors hover:border-ink/30"
              >
                <p className="font-semibold text-ink">{q}</p>
                <p className="mt-1 text-sm text-soft">{a}</p>
                <p className="mt-3 font-mono text-xs font-semibold text-accent">
                  En savoir plus →
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
