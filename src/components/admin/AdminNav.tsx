"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/entreprises", label: "Entreprises" },
  { href: "/admin/avis", label: "Avis & modération" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/messages", label: "Messages" },
];

export function AdminNav({
  variant = "vertical",
}: {
  variant?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  return (
    <nav
      className={
        variant === "horizontal"
          ? "flex gap-1 overflow-x-auto pb-1"
          : "space-y-1"
      }
    >
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-md px-3 py-2 text-sm transition ${
              variant === "horizontal" ? "shrink-0 whitespace-nowrap" : ""
            } ${
              active
                ? "bg-accent text-white"
                : "text-paper/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
