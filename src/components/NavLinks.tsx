"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/entreprises", label: "Entreprises" },
  { href: "/classements", label: "Classements" },
  { href: "/methode", label: "Méthodologie" },
  { href: "/a-propos", label: "À propos" },
];

export function NavLinks({
  tone,
}: {
  tone: "default" | "user" | "company";
}) {
  const pathname = usePathname();
  const colored = tone !== "default";
  const links =
    tone === "company"
      ? LINKS.filter(
          (link) => link.href === "/classements" || link.href === "/methode",
        )
      : LINKS;

  return (
    <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative py-1 transition ${
              colored
                ? active
                  ? "text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-white/80"
                  : "text-paper/70 hover:text-white"
                : active
                  ? "text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-accent"
                  : "text-soft hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
