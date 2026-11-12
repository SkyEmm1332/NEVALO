"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

const ITEMS = [
  { href: "/mon-espace", label: "Mes avis" },
  { href: "/mon-espace/parametres", label: "Paramètres" },
  { href: "/faq", label: "Centre d'aide" },
];

function initials(name: string): string {
  const cleaned = name.replace(/@.*/, "");
  const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
  const letters = parts
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (letters || name[0] || "N").toUpperCase();
}

export function UserMenu({ name }: { name: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

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
    <details ref={ref} className="group relative">
      <summary
        title={name}
        className="flex cursor-pointer list-none items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-sm text-ink shadow-card transition hover:border-ink/30 hover:shadow-lift [&::-webkit-details-marker]:hidden"
      >
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold tracking-wide text-white"
        >
          {initials(name)}
        </span>
        <span className="max-w-[9rem] truncate font-semibold tracking-tight">
          {name}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          fill="none"
          className="h-3 w-3 shrink-0 text-muted transition-transform group-open:rotate-180"
        >
          <path
            d="m2.5 4.5 3.5 3 3.5-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>

      <div
        onClick={() => {
          if (ref.current) ref.current.open = false;
        }}
        className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-surface shadow-lift"
      >
        <div className="flex items-center gap-3 border-b border-line bg-paper/60 px-4 py-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white"
          >
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Mon compte
            </p>
          </div>
        </div>

        <div className="p-2">
          <nav aria-label="Menu utilisateur" className="space-y-0.5">
            {ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-soft transition hover:bg-paper hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-1 border-t border-line pt-1">
            <LogoutButton className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-soft transition hover:bg-paper hover:text-ink" />
          </div>
        </div>
      </div>
    </details>
  );
}
