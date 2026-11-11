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
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-line-strong px-3 py-2 text-sm font-semibold text-ink transition hover:border-ink [&::-webkit-details-marker]:hidden">
        <span className="max-w-[10rem] truncate">{name}</span>
        <span className="font-mono text-xs text-muted transition group-open:rotate-180">
          ↓
        </span>
      </summary>

      <div
        onClick={() => {
          if (ref.current) ref.current.open = false;
        }}
        className="absolute right-0 top-full z-30 mt-2 w-56 border border-line bg-surface p-2 shadow-card"
      >
        <nav aria-label="Menu utilisateur">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-sm font-medium text-soft transition hover:bg-paper hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-1 border-t border-line pt-1">
          <LogoutButton className="block w-full px-3 py-2 text-left text-sm font-medium text-soft transition hover:bg-paper hover:text-ink" />
        </div>
      </div>
    </details>
  );
}
