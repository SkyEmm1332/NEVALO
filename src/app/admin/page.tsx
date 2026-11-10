import Link from "next/link";
import { prisma } from "@/lib/prisma";

const REVIEW_STATUS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-paper text-soft" },
  IN_VERIFICATION: { label: "En vérification", className: "bg-blue/10 text-blue" },
  VERIFIED: { label: "Vérifié", className: "bg-accent/10 text-accent" },
  UNVERIFIED: { label: "Non vérifié", className: "bg-gold/15 text-[#96680f]" },
  IN_MODERATION: { label: "En modération", className: "bg-accent/10 text-accent" },
  PUBLISHED: { label: "Publié", className: "bg-accent/10 text-accent" },
  REJECTED: { label: "Rejeté", className: "bg-danger/10 text-danger" },
  CONTESTED: { label: "Contesté", className: "bg-gold/15 text-[#96680f]" },
};

export default async function AdminOverviewPage() {
  const [
    companyCount,
    pendingCompanies,
    publishedCompanies,
    reviewCount,
    publishedReviews,
    moderationReviews,
    userCount,
    openReports,
    pendingCompanyList,
    recentReviews,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: "PENDING" } }),
    prisma.company.count({ where: { status: "PUBLISHED" } }),
    prisma.review.count(),
    prisma.review.count({ where: { status: "PUBLISHED" } }),
    prisma.review.count({
      where: { status: { in: ["IN_MODERATION", "CONTESTED"] } },
    }),
    prisma.user.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.company.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { company: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { label: "Entreprises", value: companyCount, href: "/admin/entreprises" },
    {
      label: "En attente de validation",
      value: pendingCompanies,
      href: "/admin/entreprises",
    },
    {
      label: "Entreprises publiées",
      value: publishedCompanies,
      href: "/admin/entreprises",
    },
    { label: "Avis", value: reviewCount, href: "/admin/avis" },
    { label: "Avis publiés", value: publishedReviews, href: "/admin/avis" },
    { label: "À modérer", value: moderationReviews, href: "/admin/avis" },
    { label: "Utilisateurs", value: userCount, href: "/admin/utilisateurs" },
    { label: "Signalements ouverts", value: openReports, href: "/admin/avis" },
  ];

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold">Vue d&apos;ensemble</h1>
      <p className="mt-1 text-sm text-muted">État de la plateforme NEVALO.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-line bg-surface p-5 transition hover:border-accent"
          >
            <div className="font-mono text-3xl font-bold tabular text-accent">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Entreprises en attente</h2>
            <Link
              href="/admin/entreprises"
              className="text-sm text-accent hover:underline"
            >
              Tout voir
            </Link>
          </div>
          {pendingCompanyList.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Aucune entreprise en attente de validation.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {pendingCompanyList.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted">{c.city ?? "—"}</p>
                  </div>
                  <Link
                    href="/admin/entreprises"
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Valider
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Derniers avis</h2>
            <Link
              href="/admin/avis"
              className="text-sm text-accent hover:underline"
            >
              Tout voir
            </Link>
          </div>
          {recentReviews.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Aucun avis pour le moment.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {recentReviews.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.company.name}</p>
                    <p className="truncate text-xs text-muted">
                      {r.jobTitle} ·{" "}
                      {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                      REVIEW_STATUS[r.status]?.className ?? "bg-paper text-soft"
                    }`}
                  >
                    {REVIEW_STATUS[r.status]?.label ?? r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
