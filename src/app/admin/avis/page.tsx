import Link from "next/link";
import type { Prisma, ReviewStatus, Visibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { setReviewStatus } from "@/app/admin/actions";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminSummary } from "@/components/admin/AdminSummary";
import {
  ADMIN_INPUT_CLASS,
  ADMIN_LABEL_CLASS,
  REVIEW_STATUS_META,
  TONE_DOT,
  USER_ROLE_META,
  formatAdminDate,
} from "@/lib/admin-ui";
import {
  ADMIN_PAGE_SIZE,
  adminPage,
  adminParam,
  type AdminSearchParams,
} from "@/lib/admin-search";

const STATUS_FILTERS: ReviewStatus[] = [
  "DRAFT",
  "IN_VERIFICATION",
  "VERIFIED",
  "UNVERIFIED",
  "IN_MODERATION",
  "PUBLISHED",
  "REJECTED",
  "CONTESTED",
];

const QUEUE_STATUSES: ReviewStatus[] = [
  "IN_VERIFICATION",
  "IN_MODERATION",
  "CONTESTED",
];

const VISIBILITY_LABEL: Record<Visibility, string> = {
  ANONYMOUS: "Anonyme",
  PSEUDONYM: "Pseudonyme",
  NOMINATIVE: "Nominatif",
};

const VISIBILITY_FILTERS: Visibility[] = [
  "ANONYMOUS",
  "PSEUDONYM",
  "NOMINATIVE",
];

const PERIOD_FILTERS = [
  { value: "7", label: "7 derniers jours", days: 7 },
  { value: "30", label: "30 derniers jours", days: 30 },
  { value: "90", label: "90 derniers jours", days: 90 },
] as const;

const SORTS = [
  { value: "recent", label: "Plus récents" },
  { value: "oldest", label: "Plus anciens" },
  { value: "company", label: "Entreprise A–Z" },
] as const;

type ReviewView = "all" | "queue" | "reported";

type AdminReviewsPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const params = await searchParams;
  const q = adminParam(params, "q");
  const rawStatus = adminParam(params, "status");
  const rawView = adminParam(params, "view");
  const legacyReported = adminParam(params, "reported") === "1";
  const view: ReviewView =
    rawView === "queue" || rawStatus === "QUEUE"
      ? "queue"
      : rawView === "reported" || legacyReported
        ? "reported"
        : "all";

  const statusFilter =
    view === "queue"
      ? QUEUE_STATUSES.includes(rawStatus as ReviewStatus)
        ? (rawStatus as ReviewStatus)
        : null
      : STATUS_FILTERS.includes(rawStatus as ReviewStatus)
        ? (rawStatus as ReviewStatus)
        : null;

  const visibility = adminParam(params, "visibility");
  const visibilityFilter = VISIBILITY_FILTERS.includes(visibility as Visibility)
    ? (visibility as Visibility)
    : null;

  const rawPeriod = adminParam(params, "period");
  const period = PERIOD_FILTERS.find((item) => item.value === rawPeriod);

  const rawSort = adminParam(params, "sort");
  const sort = SORTS.some((item) => item.value === rawSort)
    ? rawSort
    : "recent";

  const requestedPage = adminPage(params);

  const filters: Prisma.ReviewWhereInput[] = [];

  if (q) {
    filters.push({
      OR: [
        { company: { name: { contains: q, mode: "insensitive" } } },
        { author: { name: { contains: q, mode: "insensitive" } } },
        { author: { email: { contains: q, mode: "insensitive" } } },
        { jobTitle: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { comment: { contains: q, mode: "insensitive" } },
        { positives: { contains: q, mode: "insensitive" } },
        { negatives: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (view === "queue") {
    filters.push({ status: { in: QUEUE_STATUSES } });
  }

  if (view === "reported") {
    filters.push({ reports: { some: { status: "OPEN" } } });
  }

  if (statusFilter) {
    filters.push({ status: statusFilter });
  }

  if (visibilityFilter) {
    filters.push({ visibility: visibilityFilter });
  }

  if (period) {
    const since = new Date();
    since.setDate(since.getDate() - period.days);
    filters.push({ createdAt: { gte: since } });
  }

  const where: Prisma.ReviewWhereInput =
    filters.length > 0 ? { AND: filters } : {};

  const [totalReviews, queueCount, publishedCount, openReports, reportedReviewCount] =
    await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { status: { in: QUEUE_STATUSES } } }),
      prisma.review.count({ where: { status: "PUBLISHED" } }),
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.review.count({
        where: { reports: { some: { status: "OPEN" } } },
      }),
    ]);

  const total = await prisma.review.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const orderBy: Prisma.ReviewOrderByWithRelationInput[] =
    sort === "oldest"
      ? [{ createdAt: "asc" }]
      : sort === "company"
        ? [{ company: { name: "asc" } }, { createdAt: "desc" }]
        : [{ createdAt: "desc" }];

  const reviews = await prisma.review.findMany({
    where,
    orderBy,
    skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          claimed: true,
          status: true,
        },
      },
      author: {
        select: { id: true, name: true, email: true, role: true },
      },
      reports: {
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reason: true,
          details: true,
          createdAt: true,
          reporter: { select: { name: true, email: true } },
        },
      },
    },
  });

  const hasFilters = Boolean(
    q || statusFilter || visibilityFilter || period || sort !== "recent",
  );
  const resetHref =
    view === "all" ? "/admin/avis" : `/admin/avis?view=${view}`;

  const viewDescription =
    view === "queue"
      ? "Avis en vérification, en modération ou contestés."
      : view === "reported"
        ? "Avis avec au moins un signalement ouvert."
        : "Tous les avis avec leur auteur, leur statut et leurs signalements.";

  const tabs = [
    {
      href: "/admin/avis",
      label: "Tous les avis",
      count: totalReviews,
      active: view === "all",
    },
    {
      href: "/admin/avis?view=queue",
      label: "À modérer",
      count: queueCount,
      active: view === "queue",
    },
    {
      href: "/admin/avis?view=reported",
      label: "Signalés",
      count: reportedReviewCount,
      active: view === "reported",
    },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Avis & modération"
        description="Modérez les avis avec le contexte auteur, entreprise et signalements."
        badge={
          queueCount > 0
            ? { label: `${queueCount} à modérer`, tone: "gold" }
            : undefined
        }
      />

      <AdminSummary
        items={[
          {
            label: "Avis",
            value: totalReviews,
            detail: "Bibliothèque complète",
            tone: "ink",
          },
          {
            label: "File de modération",
            value: queueCount,
            detail: "Vérification, modération, contestation",
            tone: "gold",
          },
          {
            label: "Signalements",
            value: openReports,
            detail: "Signalements ouverts",
            tone: "danger",
          },
          {
            label: "Publiés",
            value: publishedCount,
            detail: "Visibles publiquement",
            tone: "accent",
          },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                tab.active
                  ? "bg-accent text-white"
                  : "text-soft hover:bg-paper"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                  tab.active
                    ? "bg-white/15 text-white"
                    : "bg-paper text-muted"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted">
          {total} avis dans cette vue
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs text-muted">{viewDescription}</p>
        <AdminFilterBar
          action="/admin/avis"
          resetHref={resetHref}
          hasFilters={hasFilters}
          layoutClassName="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"
        >
          {view !== "all" ? (
            <input type="hidden" name="view" value={view} />
          ) : null}
          <label className="lg:min-w-64 lg:flex-1">
            <span className={ADMIN_LABEL_CLASS}>Rechercher</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Entreprise, auteur, poste ou contenu"
              className={ADMIN_INPUT_CLASS}
            />
          </label>
          <label className="lg:w-48">
            <span className={ADMIN_LABEL_CLASS}>Statut</span>
            <select
              name="status"
              defaultValue={
                view === "queue" ? statusFilter ?? "QUEUE" : statusFilter ?? ""
              }
              className={ADMIN_INPUT_CLASS}
            >
              {view === "queue" ? (
                <>
                  <option value="QUEUE">Toute la file</option>
                  {QUEUE_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {REVIEW_STATUS_META[item].label}
                    </option>
                  ))}
                </>
              ) : (
                <>
                  <option value="">Tous les statuts</option>
                  {STATUS_FILTERS.map((item) => (
                    <option key={item} value={item}>
                      {REVIEW_STATUS_META[item].label}
                    </option>
                  ))}
                </>
              )}
            </select>
          </label>
          <label className="lg:w-40">
            <span className={ADMIN_LABEL_CLASS}>Visibilité</span>
            <select
              name="visibility"
              defaultValue={visibilityFilter ?? ""}
              className={ADMIN_INPUT_CLASS}
            >
              <option value="">Toutes</option>
              {VISIBILITY_FILTERS.map((item) => (
                <option key={item} value={item}>
                  {VISIBILITY_LABEL[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="lg:w-48">
            <span className={ADMIN_LABEL_CLASS}>Période</span>
            <select
              name="period"
              defaultValue={period?.value ?? ""}
              className={ADMIN_INPUT_CLASS}
            >
              <option value="">Toute la période</option>
              {PERIOD_FILTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="lg:w-44">
            <span className={ADMIN_LABEL_CLASS}>Trier par</span>
            <select
              name="sort"
              defaultValue={sort}
              className={ADMIN_INPUT_CLASS}
            >
              {SORTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </AdminFilterBar>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <AdminEmptyState
            title={
              view === "queue"
                ? "Aucun avis à modérer."
                : view === "reported"
                  ? "Aucun signalement ouvert."
                  : "Aucun avis ne correspond à ces filtres."
            }
            description="Modifiez la recherche, le statut ou la période pour élargir les résultats."
          />
        ) : (
          reviews.map((review) => {
            const reviewStatus = REVIEW_STATUS_META[review.status];
            const authorRole = USER_ROLE_META[review.author.role];
            const latestReport = review.reports[0];
            const excerpt =
              review.comment ||
              review.positives ||
              review.negatives ||
              review.title ||
              "Aucun texte renseigné.";

            return (
              <article
                key={review.id}
                className="relative overflow-hidden rounded-lg border border-line bg-surface"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 w-1 ${TONE_DOT[reviewStatus.tone]}`}
                />

                <div className="p-4 pl-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminStatusBadge
                          label={reviewStatus.label}
                          tone={reviewStatus.tone}
                        />
                        <AdminStatusBadge
                          label={VISIBILITY_LABEL[review.visibility]}
                          tone="muted"
                        />
                        {review.reports.length > 0 ? (
                          <AdminStatusBadge
                            label={`${review.reports.length} signalement${review.reports.length > 1 ? "s" : ""}`}
                            tone="danger"
                          />
                        ) : null}
                        <AdminStatusBadge
                          label={
                            review.company.claimed
                              ? "Fiche revendiquée"
                              : "Fiche non revendiquée"
                          }
                          tone={review.company.claimed ? "accent" : "muted"}
                        />
                        {review.company.status !== "PUBLISHED" ? (
                          <AdminStatusBadge
                            label="Entreprise non publiée"
                            tone="gold"
                          />
                        ) : null}
                      </div>

                      <h2 className="mt-2 text-base font-semibold text-ink">
                        {review.company.name}
                      </h2>
                      <p className="text-xs text-muted">
                        {review.company.city ?? "Ville non renseignée"} ·{" "}
                        {review.jobTitle} ·{" "}
                        {formatAdminDate(review.createdAt)}
                      </p>
                    </div>

                    <Link
                      href={`/admin/avis/${review.id}`}
                      className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-medium text-soft transition hover:bg-line"
                    >
                      Ouvrir →
                    </Link>
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
                    <div className="min-w-0">
                      {review.title ? (
                        <p className="text-sm font-medium text-ink">
                          {review.title}
                        </p>
                      ) : null}
                      <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-soft">
                        {excerpt}
                      </p>
                    </div>

                    <div className="rounded-md border border-line bg-paper px-3 py-2">
                      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
                        Auteur
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-ink">
                        {review.author.name ?? "Nom non renseigné"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {review.author.email}
                      </p>
                      <div className="mt-2">
                        <AdminStatusBadge
                          label={authorRole.label}
                          tone={authorRole.tone}
                        />
                      </div>
                    </div>
                  </div>

                  {latestReport ? (
                    <div className="mt-3 rounded-md border border-danger/20 bg-danger/5 px-3 py-2">
                      <p className="text-xs font-medium text-danger">
                        Signalé par{" "}
                        {latestReport.reporter?.name ??
                          latestReport.reporter?.email ??
                          "utilisateur supprimé"}{" "}
                        · {formatAdminDate(latestReport.createdAt)}
                      </p>
                      <p className="mt-0.5 text-xs text-soft">
                        {latestReport.reason}
                        {latestReport.details
                          ? ` — ${latestReport.details}`
                          : null}
                      </p>
                    </div>
                  ) : null}
                </div>

                {view === "queue" ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-paper px-4 py-3">
                    <p className="text-xs text-muted">Action rapide</p>
                    <div className="flex flex-wrap gap-2">
                      {review.status !== "PUBLISHED" ? (
                        <form action={setReviewStatus}>
                          <input type="hidden" name="id" value={review.id} />
                          <button
                            type="submit"
                            name="status"
                            value="PUBLISHED"
                            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-deep"
                          >
                            Publier
                          </button>
                        </form>
                      ) : null}
                      {review.status !== "REJECTED" ? (
                        <form action={setReviewStatus}>
                          <input type="hidden" name="id" value={review.id} />
                          <button
                            type="submit"
                            name="status"
                            value="REJECTED"
                            className="rounded-md border border-danger/30 bg-danger/5 px-3 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10"
                          >
                            Rejeter
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>

      <AdminPagination
        basePath="/admin/avis"
        page={currentPage}
        totalPages={totalPages}
        totalItems={total}
        labels={{ singular: "avis", plural: "avis" }}
        query={{
          view: view === "all" ? "" : view,
          q,
          status: statusFilter ?? "",
          visibility: visibilityFilter ?? "",
          period: period?.value ?? "",
          sort: sort === "recent" ? "" : sort,
        }}
        className="rounded-lg border border-line"
      />
    </div>
  );
}
