import Link from "next/link";
import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { AutoBreadcrumbs } from "@/components/AutoBreadcrumbs";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <Header session={session} />
      <main className="flex flex-1 flex-col">
        <AutoBreadcrumbs />
        {children}
      </main>
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-ink bg-ink font-mono text-[10px] font-bold text-paper">
                  N
                </span>
                <span className="font-extrabold uppercase tracking-tight text-ink">
                  Nevalo
                </span>
              </div>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                Le registre de la transparence professionnelle en Côte
                d&apos;Ivoire. Des expériences réelles, anonymes ou nominatives,
                pour choisir un employeur en connaissance de cause.
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                Plateforme
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/entreprises" className="transition hover:text-ink">
                    Entreprises
                  </Link>
                </li>
                <li>
                  <Link href="/classements" className="transition hover:text-ink">
                    Classements
                  </Link>
                </li>
                <li>
                  <Link href="/deposer-avis" className="transition hover:text-ink">
                    Déposer un avis
                  </Link>
                </li>
                <li>
                  <Link href="/proposer-entreprise" className="transition hover:text-ink">
                    Proposer une entreprise
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                À propos
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/a-propos" className="transition hover:text-ink">
                    Qui sommes-nous
                  </Link>
                </li>
                <li>
                  <Link href="/methode" className="transition hover:text-ink">
                    Méthodologie
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="transition hover:text-ink">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition hover:text-ink">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/mentions-legales" className="transition hover:text-ink">
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center">
            <p className="font-mono text-xs">
              © {new Date().getFullYear()} Nevalo — Registre de la transparence
              professionnelle.
            </p>
            <p className="font-mono text-xs">Abidjan, Côte d&apos;Ivoire</p>
          </div>
        </div>
      </footer>
    </>
  );
}
