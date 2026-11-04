import Link from "next/link";
import type { Session } from "next-auth";
import { LogoutButton } from "@/components/LogoutButton";
import { NavLinks } from "@/components/NavLinks";

export function Header({ session }: { session: Session | null }) {
  const isAdmin =
    session?.user.role === "ADMIN" || session?.user.role === "MODERATOR";

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-ink font-mono text-xs font-bold text-paper">
              N
            </span>
            <span className="text-lg font-extrabold uppercase tracking-tight text-ink">
              Nevalo
            </span>
          </Link>
          <NavLinks />
        </div>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/deposer-avis"
                className="rounded-md border border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-soft"
              >
                Déposer un avis
              </Link>
              <span className="hidden text-sm text-soft lg:inline">
                {session.user.name ?? session.user.email}
              </span>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="rounded-md border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink"
                >
                  Admin
                </Link>
              ) : null}
              <Link
                href="/mon-espace"
                className="hidden text-sm font-medium text-soft transition hover:text-ink md:inline"
              >
                Mon espace
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-soft transition hover:text-ink"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-soft"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
