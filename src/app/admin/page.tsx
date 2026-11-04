import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    <div>
      <h1 className="text-2xl font-bold">Vue d&apos;ensemble</h1>
      <p className="mt-1 text-sm text-slate-500">État de la plateforme NEVALO.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand"
          >
            <div className="text-3xl font-bold text-brand">{s.value}</div>
            <div className="mt-1 text-sm text-slate-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Entreprises en attente</h2>
            <Link
              href="/admin/entreprises"
              className="text-sm text-brand hover:underline"
            >
              Tout voir
            </Link>
          </div>
          {pendingCompanyList.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Aucune entreprise en attente de validation.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {pendingCompanyList.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.city ?? "—"}</p>
                  </div>
                  <Link
                    href="/admin/entreprises"
                    className="text-xs font-medium text-brand hover:underline"
                  >
                    Valider
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Derniers avis</h2>
            <Link
              href="/admin/avis"
              className="text-sm text-brand hover:underline"
            >
              Tout voir
            </Link>
          </div>
          {recentReviews.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Aucun avis pour le moment.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {recentReviews.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{r.company.name}</p>
                    <p className="text-xs text-slate-400">
                      {r.jobTitle} ·{" "}
                      {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {r.status}
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
