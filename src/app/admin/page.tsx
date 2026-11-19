import Link from "next/link";
import type { ReviewStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { markMessageRead, setReportStatus } from "./actions";

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

const COMPANY_STATUS: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "Publiée", className: "bg-accent/10 text-accent" },
  PENDING: { label: "En attente", className: "bg-gold/15 text-[#96680f]" },
  REJECTED: { label: "Rejetée", className: "bg-danger/10 text-danger" },
};

const ROLES: { value: UserRole; label: string }[] = [
  { value: "ADMIN", label: "Administrateurs" },
  { value: "MODERATOR", label: "Modérateurs" },
  { value: "CONTRIBUTOR", label: "Contributeurs" },
  { value: "REPRESENTATIVE", label: "Représentants" },
];

const QUEUE_STATUSES: ReviewStatus[] = [
  "IN_VERIFICATION",
  "IN_MODERATION",
  "CONTESTED",
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function initial(value: string) {
  return value.trim().charAt(0).toUpperCase() || "?";
}

export default async function AdminOverviewPage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    companyCount,
    pendingCompanies,
    companiesWithoutReviews,
    publishedReviews,
    pendingReviews,
    userCount,
    newUsers,
    openReports,
    totalMessages,
    unreadMessages,
    pendingCompanyList,
    recentCompanies,
    recentReviews,
    unreadMessageList,
    roleCounts,
    openReportList,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: "PENDING" } }),
    prisma.company.count({ where: { reviews: { none: {} } } }),
    prisma.review.count({ where: { status: "PUBLISHED" } }),
    prisma.review.count({ where: { status: { in: QUEUE_STATUSES } } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.company.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { reviews: true } } },
    }),
    prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { reviews: true } } },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { company: { select: { name: true, slug: true } } },
    }),
    prisma.contactMessage.findMany({
      where: { read: false },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
    prisma.report.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        review: {
          select: {
            id: true,
            jobTitle: true,
            company: { select: { name: true, slug: true } },
          },
        },
      },
    }),
  ]);

  const actionTotal =
    pendingCompanies + pendingReviews + unreadMessages + openReports;
  const companyItems = [
    ...pendingCompanyList,
    ...recentCompanies.filter(
      (company) =>
        !pendingCompanyList.some((pending) => pending.id === company.id),
    ),
  ].slice(0, 5);

  const priorities = [
    {
      label: "Entreprises à valider",
      value: pendingCompanies,
      detail: `${companyCount} fiches au total`,
      href: "/admin/entreprises?status=PENDING",
      bar: "bg-gold",
    },
    {
      label: "Avis à traiter",
      value: pendingReviews,
      detail: `${publishedReviews} publiés`,
      href: "/admin/avis?view=queue",
      bar: "bg-accent",
    },
    {
      label: "Messages non lus",
      value: unreadMessages,
      detail: `${totalMessages} reçus`,
      href: "/admin/messages?read=unread",
      bar: "bg-blue",
    },
    {
      label: "Signalements ouverts",
      value: openReports,
      detail: openReports > 0 ? "À examiner" : "Aucun",
      href: openReports > 0 ? "#signalements" : "/admin/avis",
      bar: "bg-danger",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            actionTotal > 0
              ? "bg-danger/10 text-danger"
              : "bg-accent/10 text-accent"
          }`}
        >
          {actionTotal > 0 ? `${actionTotal} à traiter` : "À jour"}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {priorities.map((priority) => (
          <Link
            key={priority.label}
            href={priority.href}
            className="group relative overflow-hidden rounded-lg border border-line bg-surface p-4 transition hover:border-accent"
          >
            <span className={`absolute inset-x-0 top-0 h-1 ${priority.bar}`} />
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-muted">
                {priority.label}
              </span>
              <span className="text-xs text-muted transition group-hover:text-accent">
                →
              </span>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold tabular text-ink">
              {priority.value}
            </p>
            <p className="mt-1 text-xs text-muted">{priority.detail}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
        <section className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <h2 className="font-semibold">Derniers avis</h2>
            </div>
            <p className="mt-1 text-xs text-muted">
              {pendingReviews} à traiter · {publishedReviews} publiés
            </p>
          </div>

          {recentReviews.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Aucun avis pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recentReviews.map((review) => {
                const status =
                  REVIEW_STATUS[review.status] ?? {
                    label: review.status,
                    className: "bg-paper text-soft",
                  };
                const excerpt = review.comment || review.positives || review.negatives;
                const content = (
                  <>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-xs font-semibold text-accent">
                      {initial(review.company.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          {review.company.name}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted">
                        {review.jobTitle} · {formatDate(review.createdAt)}
                      </p>
                      {excerpt ? (
                        <p className="mt-1 line-clamp-1 text-xs text-soft">
                          {excerpt}
                        </p>
                      ) : null}
                    </div>
                  </>
                );

                return (
                  <li key={review.id}>
                    {review.company.slug ? (
                      <a
                        href={`/entreprises/${review.company.slug}#avis-${review.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-3 px-4 py-3 transition hover:bg-paper"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="flex items-start gap-3 px-4 py-3">
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/admin/avis"
            className="mt-auto flex items-center justify-between border-t border-line px-4 py-3 text-xs font-medium text-accent transition hover:bg-paper"
          >
            <span>Modérer les avis</span>
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
              <h2 className="font-semibold">Entreprises</h2>
            </div>
            <p className="mt-1 text-xs text-muted">
              {companyCount} fiches · {pendingCompanies} en attente ·{" "}
              {companiesWithoutReviews} sans avis
            </p>
          </div>

          {companyItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Aucune entreprise enregistrée.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {companyItems.map((company) => {
                const status =
                  COMPANY_STATUS[company.status] ?? {
                    label: company.status,
                    className: "bg-paper text-soft",
                  };

                return (
                  <li key={company.id}>
                    <Link
                      href={`/admin/entreprises/${company.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-paper"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 font-mono text-xs font-semibold text-[#96680f]">
                        {initial(company.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {company.name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {company.city ?? "—"} · {company._count.reviews} avis
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/admin/entreprises"
            className="mt-auto flex items-center justify-between border-t border-line px-4 py-3 text-xs font-medium text-accent transition hover:bg-paper"
          >
            <span>Voir les entreprises</span>
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue" />
              <h2 className="font-semibold">Messages</h2>
            </div>
            <p className="mt-1 text-xs text-muted">
              {unreadMessages} non lus · {totalMessages} reçus
            </p>
          </div>

          {unreadMessageList.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Aucun message non lu.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {unreadMessageList.map((message) => (
                <li key={message.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue/10 font-mono text-xs font-semibold text-blue">
                    {initial(message.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {message.subject ?? "Sans objet"}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {message.name} · {formatDate(message.createdAt)}
                        </p>
                      </div>
                      <form action={markMessageRead}>
                        <input type="hidden" name="id" value={message.id} />
                        <button
                          type="submit"
                          className="shrink-0 whitespace-nowrap rounded-md border border-line bg-paper px-2 py-1 text-[11px] font-medium text-soft transition hover:bg-line"
                        >
                          Marquer lu
                        </button>
                      </form>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-soft">
                      {message.message}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Link
            href={
              unreadMessages > 0
                ? "/admin/messages?read=unread"
                : "/admin/messages"
            }
            className="mt-auto flex items-center justify-between border-t border-line px-4 py-3 text-xs font-medium text-accent transition hover:bg-paper"
          >
            <span>
              {unreadMessages > 0
                ? `Voir les ${unreadMessages} messages non lus`
                : "Ouvrir les messages"}
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-ink" />
              <h2 className="font-semibold">Utilisateurs</h2>
            </div>
            <p className="mt-1 text-xs text-muted">
              {userCount} comptes
              {newUsers > 0 ? ` · +${newUsers} cette semaine` : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-4">
            {ROLES.map((role) => {
              const count =
                roleCounts.find((item) => item.role === role.value)?._count
                  ._all ?? 0;
              return (
                <div
                  key={role.value}
                  className="rounded-md border border-line bg-paper px-3 py-2.5"
                >
                  <p className="text-xs text-muted">{role.label}</p>
                  <p className="mt-1 font-mono text-lg font-bold tabular text-ink">
                    {count}
                  </p>
                </div>
              );
            })}
            <div className="col-span-2 flex items-center justify-between rounded-md border border-line bg-paper px-3 py-2.5">
              <p className="text-xs text-muted">Nouveaux cette semaine</p>
              <p className="font-mono text-lg font-bold tabular text-ink">
                {newUsers}
              </p>
            </div>
          </div>

          <Link
            href="/admin/utilisateurs"
            className="mt-auto flex items-center justify-between border-t border-line px-4 py-3 text-xs font-medium text-accent transition hover:bg-paper"
          >
            <span>Gérer les utilisateurs</span>
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>

      {openReportList.length > 0 ? (
        <section
          id="signalements"
          className="mt-4 overflow-hidden rounded-lg border border-danger/30 bg-danger/5"
        >
          <div className="border-b border-danger/20 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" />
              <h2 className="font-semibold text-danger">Signalements ouverts</h2>
            </div>
            <p className="mt-1 text-xs text-muted">
              {openReports} à examiner
            </p>
          </div>

          <ul className="divide-y divide-danger/10">
            {openReportList.map((report) => (
              <li key={report.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {report.reason}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {report.review
                        ? `${report.review.company.name} · ${report.review.jobTitle}`
                        : "Signalement général"}{" "}
                      · {formatDate(report.createdAt)}
                    </p>
                  </div>
                  <form action={setReportStatus}>
                    <input type="hidden" name="id" value={report.id} />
                    <button
                      type="submit"
                      name="status"
                      value="REVIEWED"
                      className="shrink-0 whitespace-nowrap rounded-md bg-danger px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-danger/90"
                    >
                      Marquer traité
                    </button>
                  </form>
                </div>
                {report.details ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-soft">
                    {report.details}
                  </p>
                ) : null}
                {report.review?.company.slug ? (
                  <a
                    href={`/entreprises/${report.review.company.slug}#avis-${report.review.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-danger hover:underline"
                  >
                    Voir l&apos;avis concerné
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
