import type { CompanyStatus, ReviewStatus, UserRole } from "@prisma/client";

export type AdminTone = "accent" | "gold" | "blue" | "danger" | "muted" | "ink";

export const ADMIN_LABEL_CLASS =
  "font-mono text-[10px] uppercase tracking-wide text-muted";

export const ADMIN_INPUT_CLASS =
  "mt-1 w-full rounded-md border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent";

export const TONE_BADGE: Record<AdminTone, string> = {
  accent: "bg-accent/10 text-accent",
  gold: "bg-gold/15 text-[#96680f]",
  blue: "bg-blue/10 text-blue",
  danger: "bg-danger/10 text-danger",
  muted: "bg-paper text-soft",
  ink: "bg-ink/5 text-ink",
};

export const TONE_DOT: Record<AdminTone, string> = {
  accent: "bg-accent",
  gold: "bg-gold",
  blue: "bg-blue",
  danger: "bg-danger",
  muted: "bg-line-strong",
  ink: "bg-ink",
};

export const COMPANY_STATUS_META: Record<
  CompanyStatus,
  { label: string; tone: AdminTone }
> = {
  PUBLISHED: { label: "Publiée", tone: "accent" },
  PENDING: { label: "En attente", tone: "gold" },
  REJECTED: { label: "Rejetée", tone: "danger" },
};

export const REVIEW_STATUS_META: Record<
  ReviewStatus,
  { label: string; tone: AdminTone }
> = {
  DRAFT: { label: "Brouillon", tone: "muted" },
  IN_VERIFICATION: { label: "En vérification", tone: "blue" },
  VERIFIED: { label: "Vérifié", tone: "accent" },
  UNVERIFIED: { label: "Non vérifié", tone: "gold" },
  IN_MODERATION: { label: "En modération", tone: "accent" },
  PUBLISHED: { label: "Publié", tone: "accent" },
  REJECTED: { label: "Rejeté", tone: "danger" },
  CONTESTED: { label: "Contesté", tone: "gold" },
};

export const USER_ROLES: {
  value: UserRole;
  label: string;
  plural: string;
  tone: AdminTone;
}[] = [
  { value: "ADMIN", label: "Administrateur", plural: "Administrateurs", tone: "ink" },
  { value: "MODERATOR", label: "Modérateur", plural: "Modérateurs", tone: "blue" },
  { value: "CONTRIBUTOR", label: "Contributeur", plural: "Contributeurs", tone: "accent" },
  { value: "REPRESENTATIVE", label: "Représentant", plural: "Représentants", tone: "gold" },
];

export const USER_ROLE_META = Object.fromEntries(
  USER_ROLES.map((role) => [role.value, role]),
) as Record<UserRole, (typeof USER_ROLES)[number]>;

export function adminInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || "?";
}

export function formatAdminDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}
