"use client";

import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { Crumb } from "@/components/Breadcrumbs";

const LABELS: Record<string, string> = {
  entreprises: "Entreprises",
  classements: "Classements",
  methode: "Méthodologie",
  "a-propos": "À propos",
  faq: "FAQ",
  contact: "Contact",
  "mentions-legales": "Mentions légales",
  login: "Connexion",
  register: "Créer un compte",
  "mon-espace": "Mon espace",
  parametres: "Paramètres",
  "deposer-avis": "Déposer un avis",
  "proposer-entreprise": "Proposer une entreprise",
};

function labelFor(segment: string) {
  return (
    LABELS[segment] ??
    segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function AutoBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;
  if (segments[0] === "entreprises" && segments.length > 1) return null;

  const items: Crumb[] = segments.map((segment, index) => ({
    label: labelFor(segment),
    href:
      index === segments.length - 1
        ? undefined
        : "/" + segments.slice(0, index + 1).join("/"),
  }));

  return <Breadcrumbs items={items} />;
}
