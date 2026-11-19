import Link from "next/link";
import type { Session } from "next-auth";
import { NotificationBell } from "@/components/NotificationBell";
import { MessagesIcon } from "@/components/MessagesIcon";
import { NavLinks } from "@/components/NavLinks";
import { MobileMenu } from "@/components/MobileMenu";
import { NavbarSearch } from "@/components/NavbarSearch";
import { UserMenu } from "@/components/UserMenu";
import { prisma } from "@/lib/prisma";

async function getCompanyUnreadMessages(userId: string) {
  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });
  if (!account?.companyId) return 0;
  return prisma.companyMessage.count({
    where: {
      thread: { companyId: account.companyId },
      sender: "NEVALO",
      readAt: null,
    },
  });
}

export async function Header({ session }: { session: Session | null }) {
  const isAdmin =
    session?.user.role === "ADMIN" || session?.user.role === "MODERATOR";
  const isCompany = session?.user.role === "REPRESENTATIVE";
  const tone = !session?.user
    ? "default"
    : isCompany
      ? "company"
      : "user";
  const colored = tone !== "default";
  const homeHref = isCompany ? "/mon-espace/entreprise" : "/";
  const unreadMessages =
    isCompany && session?.user?.id
      ? await getCompanyUnreadMessages(session.user.id)
      : 0;

  return (
    <header
      className={`sticky top-0 z-20 border-b backdrop-blur-sm transition-colors ${
        tone === "company"
          ? "border-forest bg-forest"
          : tone === "user"
            ? "border-accent bg-accent"
            : "border-line bg-paper/90"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href={homeHref} className="flex items-center gap-2.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-xs font-bold ${
                colored
                  ? "border-paper bg-paper text-ink"
                  : "border-ink bg-ink text-paper"
              }`}
            >
              N
            </span>
            <span
              className={`hidden text-lg font-extrabold uppercase tracking-tight sm:inline ${
                colored ? "text-white" : "text-ink"
              }`}
            >
              Nevalo
            </span>
          </Link>
          <NavLinks tone={tone} />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {!isCompany ? <NavbarSearch tone={tone} /> : null}

          <div className="hidden items-center gap-3 lg:flex">
            {session?.user ? (
              <>
                {isCompany ? (
                  <>
                    <MessagesIcon unread={unreadMessages} />
                    <NotificationBell />
                  </>
                ) : (
                  <Link
                    href="/deposer-avis"
                    className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                      colored
                        ? "border-paper bg-paper text-accent hover:bg-paper/90"
                        : "border-ink bg-ink text-paper hover:bg-soft"
                    }`}
                  >
                    Déposer un avis
                  </Link>
                )}
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                      colored
                        ? "border-white/40 text-paper hover:border-white hover:bg-white/10"
                        : "border-line-strong text-ink hover:border-ink"
                    }`}
                  >
                    Admin
                  </Link>
                ) : null}
                <UserMenu
                  name={session.user.name ?? session.user.email ?? "Mon compte"}
                  isCompany={isCompany}
                />
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

          <MobileMenu
            isAuthenticated={Boolean(session?.user)}
            isAdmin={isAdmin}
            tone={tone}
            isCompany={isCompany}
            companyReviewCount={0}
            companyReviewsHref="/mon-espace/entreprise"
          />
        </div>
      </div>
    </header>
  );
}
