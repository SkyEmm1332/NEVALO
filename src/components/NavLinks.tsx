"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/entreprises", label: "Entreprises" },
  { href: "/classements", label: "Classements" },
  { href: "/methode", label: "Méthodologie" },
  { href: "/a-propos", label: "À propos" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative py-1 transition hover:text-ink ${
              active
                ? "text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-accent"
                : "text-soft"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
