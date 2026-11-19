"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon } from "@/components/CompanyReviewNotification";
import { LogoutButton } from "@/components/LogoutButton";

const LINKS = [
  { href: "/entreprises", label: "Entreprises" },
  { href: "/classements", label: "Classements" },
  { href: "/methode", label: "Méthodologie" },
  { href: "/a-propos", label: "À propos" },
];

export function MobileMenu({
  isAuthenticated,
  isAdmin,
  tone,
  isCompany,
  companyReviewCount,
  companyReviewsHref,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
  tone: "default" | "user" | "company";
  isCompany: boolean;
  companyReviewCount: number;
  companyReviewsHref: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const colored = tone !== "default";
  const links = isCompany
    ? LINKS.filter(
        (link) => link.href === "/classements" || link.href === "/methode",
      )
    : LINKS;

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const node = ref.current;
      if (node?.open && !node.contains(event.target as Node)) {
        node.open = false;
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <details ref={ref} className="group relative lg:hidden">
      <summary
        className={`flex cursor-pointer list-none items-center gap-2 border px-3 py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden ${
          colored
            ? "border-white/50 text-paper"
            : "border-line-strong text-ink"
        }`}
      >
        Menu
        <span
          className={`font-mono text-xs transition group-open:rotate-180 ${
            colored ? "text-paper/60" : "text-muted"
          }`}
        >
          ↓
        </span>
      </summary>

      <div
        onClick={() => {
          if (ref.current) ref.current.open = false;
        }}
        className="absolute right-0 top-full z-30 mt-2 w-64 border border-line bg-surface p-2 shadow-card"
      >
        <nav aria-label="Navigation principale">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm font-medium text-soft transition hover:bg-paper hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-2 space-y-1 border-t border-line pt-2">
          {isAuthenticated ? (
            <>
              {isCompany ? (
                <Link
                  href={companyReviewsHref}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-soft transition hover:bg-paper hover:text-ink"
                >
                  <span className="flex items-center gap-2">
                    <BellIcon className="h-4 w-4" />
                    Avis reçus
                  </span>
                  {companyReviewCount > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber px-1.5 font-mono text-[11px] font-bold text-ink">
                      {companyReviewCount}
                    </span>
                  ) : null}
                </Link>
              ) : (
                <Link
                  href="/deposer-avis"
                  className="block bg-ink px-3 py-2 text-center text-sm font-semibold text-paper"
                >
                  Déposer un avis
                </Link>
              )}
              {isCompany ? (
                <Link
                  href="/mon-espace/entreprise/messages"
                  className="block px-3 py-2 text-sm font-medium text-soft transition hover:bg-paper hover:text-ink"
                >
                  Messages
                </Link>
              ) : (
                <Link
                  href="/mon-espace"
                  className="block px-3 py-2 text-sm font-medium text-soft transition hover:bg-paper hover:text-ink"
                >
                  Mes avis
                </Link>
              )}
              <Link
                href={
                  isCompany
                    ? "/mon-espace/entreprise/parametres"
                    : "/mon-espace/parametres"
                }
                className="block px-3 py-2 text-sm font-medium text-soft transition hover:bg-paper hover:text-ink"
              >
                {isCompany ? "Modifier ma fiche" : "Paramètres"}
              </Link>
              <Link
                href="/faq"
                className="block px-3 py-2 text-sm font-medium text-soft transition hover:bg-paper hover:text-ink"
              >
                Centre d&apos;aide
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="block px-3 py-2 text-sm font-medium text-soft transition hover:bg-paper hover:text-ink"
                >
                  Administration
                </Link>
              ) : null}
              <LogoutButton className="block w-full px-3 py-2 text-left text-sm font-medium text-soft transition hover:bg-paper hover:text-ink" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-3 py-2 text-sm font-medium text-soft transition hover:bg-paper hover:text-ink"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="block bg-ink px-3 py-2 text-center text-sm font-semibold text-paper"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </details>
  );
}
