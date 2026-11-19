import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { Criterion, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { setReportStatus, setReviewStatus } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  COMPANY_STATUS_META,
  REVIEW_STATUS_META,
  TONE_DOT,
  USER_ROLE_META,
  adminInitial,
  formatAdminDate,
  type AdminTone,
} from "@/lib/admin-ui";

const CRITERION_LABEL: Record<Criterion, string> = {
  AMBIANCE: "Ambiance",
  MANAGEMENT: "Management",
  REMUNERATION: "Rémunération",
  EVOLUTION: "Évolution",
  WORKLOAD: "Charge de travail",
  WORK_LIFE_BALANCE: "Équilibre vie pro / vie perso",
  RECOGNITION: "Reconnaissance",
  WORK_CONDITIONS: "Conditions de travail",
  STABILITY: "Stabilité",
};

const REPORT_STATUS_META: Record<
  ReportStatus,
  { label: string; tone: AdminTone }
> = {
  OPEN: { label: "Ouvert", tone: "danger" },
  REVIEWED: { label: "Traité", tone: "accent" },
  CLOSED: { label: "Fermé", tone: "muted" },
};

const MODERATION_ACTIONS = [
  {
    status: "PUBLISHED",
    label: "Publier",
    className: "bg-accent text-white hover:bg-accent-deep",
  },
  {
    status: "REJECTED",
    label: "Rejeter",
    className:
      "border border-danger/30 bg-danger/5 text-danger hover:bg-danger/10",
  },
  {
    status: "IN_VERIFICATION",
    label: "Remettre en vérification",
    className:
      "border border-blue/30 bg-blue/5 text-blue hover:bg-blue/10",
  },
  {
    status: "CONTESTED",
    label: "Marquer contesté",
    className:
      "border border-gold/40 bg-gold/10 text-[#96680f] hover:bg-gold/15",
  },
] as const;

function DetailSection({
  title,
  description,
  tone,
  children,
}: {
  title: string;
  description?: string;
  tone: AdminTone;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="border-b border-line p-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[tone]}`}
          />
          <h2 className="font-semibold text-ink">{title}</h2>
        </div>
        {description ? (
          <p className="mt-1 text-xs text-muted">{description}</p>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function AdminReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          sector: true,
          status: true,
          claimed: true,
          email: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { reviews: true } },
        },
      },
      reports: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reason: true,
          details: true,
          status: true,
          createdAt: true,
          reporter: { select: { name: true, email: true, role: true } },
        },
      },
      establishment: { select: { name: true } },
      department: { select: { name: true } },
      ratings: { select: { criterion: true, score: true } },
      responses: {
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, createdAt: true },
      },
      salaryReport: {
        select: { amount: true, currency: true, period: true, isNet: true },
      },
    },
  });

  if (!review) notFound();

  const reviewStatus = REVIEW_STATUS_META[review.status];
  const companyStatus = COMPANY_STATUS_META[review.company.status];
  const authorRole = USER_ROLE_META[review.author.role];
  const openReports = review.reports.filter(
    (report) => report.status === "OPEN",
  ).length;
  const isPublic =
    review.status === "PUBLISHED" && Boolean(review.company.slug);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/avis"
          className="text-xs font-medium text-accent transition hover:underline"
        >
          ← Tous les avis
        </Link>
        <div className="mt-3">
          <AdminPageHeader
            title={review.title ?? `Avis sur ${review.company.name}`}
            description={`${review.author.name ?? review.author.email} · ${review.jobTitle} · ${formatLongDate(review.createdAt)}`}
            badge={{ label: reviewStatus.label, tone: reviewStatus.tone }}
            actions={
              isPublic ? (
                <a
                  href={`/entreprises/${review.company.slug}#avis-${review.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-soft transition hover:border-ink hover:text-ink"
                >
                  Voir l’avis public
                </a>
              ) : undefined
            }
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <AdminStatusBadge
            label={review.visibility === "ANONYMOUS" ? "Anonyme" : review.visibility === "PSEUDONYM" ? "Pseudonyme" : "Nominatif"}
            tone="muted"
          />
          <AdminStatusBadge
            label={companyStatus.label}
            tone={companyStatus.tone}
          />
          <AdminStatusBadge
            label={
              review.company.claimed
                ? "Fiche revendiquée"
                : "Fiche non revendiquée"
            }
            tone={review.company.claimed ? "accent" : "muted"}
          />
          {openReports > 0 ? (
            <AdminStatusBadge
              label={`${openReports} signalement${openReports > 1 ? "s" : ""} ouvert${openReports > 1 ? "s" : ""}`}
              tone="danger"
            />
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="space-y-4">
          <DetailSection
            title="Contenu de l’avis"
            description="Texte original transmis par l’auteur."
            tone="accent"
          >
            {review.title ? (
              <p className="text-base font-semibold text-ink">{review.title}</p>
            ) : null}
            {review.comment ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-soft">
                {review.comment}
              </p>
            ) : null}

            {review.positives || review.negatives ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {review.positives ? (
                  <div className="rounded-md border border-accent/20 bg-accent/5 px-3 py-2">
                    <p className="font-mono text-[10px] uppercase tracking-wide text-accent">
                      Points positifs
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-soft">
                      {review.positives}
                    </p>
                  </div>
                ) : null}
                {review.negatives ? (
                  <div className="rounded-md border border-danger/20 bg-danger/5 px-3 py-2">
                    <p className="font-mono text-[10px] uppercase tracking-wide text-danger">
                      Points négatifs
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-soft">
                      {review.negatives}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!review.title &&
            !review.comment &&
            !review.positives &&
            !review.negatives ? (
              <p className="text-sm text-muted">Aucun texte renseigné.</p>
            ) : null}
          </DetailSection>

          {review.ratings.length > 0 ? (
            <DetailSection
              title="Notes détaillées"
              description="Évaluation critère par critère."
              tone="blue"
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {review.ratings.map((rating) => (
                  <div
                    key={rating.criterion}
                    className="rounded-md border border-line bg-paper px-3 py-2"
                  >
                    <p className="text-xs text-muted">
                      {CRITERION_LABEL[rating.criterion]}
                    </p>
                    <p className="mt-1 font-mono text-lg font-bold tabular text-ink">
                      {rating.score}
                      <span className="text-xs font-normal text-muted">/5</span>
                    </p>
                  </div>
                ))}
              </div>
            </DetailSection>
          ) : null}

          {review.reports.length > 0 ? (
            <DetailSection
              title="Signalements"
              description="Qui a signalé cet avis et pour quel motif."
              tone="danger"
            >
              <div className="space-y-3">
                {review.reports.map((report) => {
                  const reportStatus = REPORT_STATUS_META[report.status];
                  const reporterRole = report.reporter
                    ? USER_ROLE_META[report.reporter.role]
                    : null;

                  return (
                    <div
                      key={report.id}
                      className="rounded-md border border-danger/20 bg-danger/5 p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">
                            {report.reason}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            Signalé par{" "}
                            {report.reporter?.name ??
                              report.reporter?.email ??
                              "utilisateur supprimé"}{" "}
                            · {formatAdminDate(report.createdAt)}
                          </p>
                          {report.reporter && reporterRole ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <AdminStatusBadge
                                label={reporterRole.label}
                                tone={reporterRole.tone}
                              />
                              <AdminStatusBadge
                                label={report.reporter.email}
                                tone="muted"
                              />
                            </div>
                          ) : null}
                        </div>
                        <AdminStatusBadge
                          label={reportStatus.label}
                          tone={reportStatus.tone}
                        />
                      </div>

                      {report.details ? (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-soft">
                          {report.details}
                        </p>
                      ) : null}

                      {report.status === "OPEN" ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <form action={setReportStatus}>
                            <input type="hidden" name="id" value={report.id} />
                            <button
                              type="submit"
                              name="status"
                              value="REVIEWED"
                              className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-deep"
                            >
                              Marquer traité
                            </button>
                          </form>
                          <form action={setReportStatus}>
                            <input type="hidden" name="id" value={report.id} />
                            <button
                              type="submit"
                              name="status"
                              value="CLOSED"
                              className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-soft transition hover:bg-paper"
                            >
                              Fermer
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </DetailSection>
          ) : null}

          {review.responses.length > 0 ? (
            <DetailSection
              title="Réponses de l’entreprise"
              description="Réponses publiées sur la fiche."
              tone="gold"
            >
              <div className="space-y-3">
                {review.responses.map((response) => (
                  <div
                    key={response.id}
                    className="rounded-md border border-line bg-paper p-3"
                  >
                    <p className="text-xs text-muted">
                      {formatAdminDate(response.createdAt)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-soft">
                      {response.content}
                    </p>
                  </div>
                ))}
              </div>
            </DetailSection>
          ) : null}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20">
          <section className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-line p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                <h2 className="font-semibold text-ink">Modération</h2>
              </div>
              <p className="mt-1 text-xs text-muted">
                Statut actuel : {reviewStatus.label}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              {MODERATION_ACTIONS.map((action) => (
                <form key={action.status} action={setReviewStatus}>
                  <input type="hidden" name="id" value={review.id} />
                  <button
                    type="submit"
                    name="status"
                    value={action.status}
                    disabled={review.status === action.status}
                    className={`w-full rounded-md px-2.5 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${action.className}`}
                  >
                    {action.label}
                  </button>
                </form>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-line p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue" />
                <h2 className="font-semibold text-ink">Auteur</h2>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue/10 font-mono text-xs font-semibold text-blue">
                  {adminInitial(review.author.name ?? review.author.email)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {review.author.name ?? "Nom non renseigné"}
                  </p>
                  <a
                    href={`mailto:${review.author.email}`}
                    className="truncate text-xs text-accent hover:underline"
                  >
                    {review.author.email}
                  </a>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <AdminStatusBadge
                  label={authorRole.label}
                  tone={authorRole.tone}
                />
                <AdminStatusBadge
                  label={`${review.author._count.reviews} avis`}
                  tone="muted"
                />
              </div>
              <p className="mt-3 text-xs text-muted">
                Compte créé le {formatLongDate(review.author.createdAt)}
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-line p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                <h2 className="font-semibold text-ink">Entreprise</h2>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-ink">
                {review.company.name}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {review.company.city ?? "Ville non renseignée"} ·{" "}
                {review.company.sector ?? "Secteur non renseigné"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <AdminStatusBadge
                  label={companyStatus.label}
                  tone={companyStatus.tone}
                />
                <AdminStatusBadge
                  label={
                    review.company.claimed
                      ? "Revendiquée"
                      : "Non revendiquée"
                  }
                  tone={review.company.claimed ? "accent" : "muted"}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/admin/entreprises/${review.company.id}`}
                  className="rounded-md border border-line bg-paper px-2.5 py-1.5 text-xs font-medium text-soft transition hover:bg-line"
                >
                  Gérer l’entreprise
                </Link>
                {review.company.slug ? (
                  <a
                    href={`/entreprises/${review.company.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-line bg-paper px-2.5 py-1.5 text-xs font-medium text-soft transition hover:bg-line"
                  >
                    Fiche publique
                  </a>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-line bg-paper p-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
              Métadonnées
            </p>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Créé le</dt>
                <dd className="font-medium text-soft">
                  {formatLongDate(review.createdAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Publié le</dt>
                <dd className="font-medium text-soft">
                  {review.publishedAt
                    ? formatLongDate(review.publishedAt)
                    : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Contrat</dt>
                <dd className="font-medium text-soft">
                  {review.contractType ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Lieu</dt>
                <dd className="truncate font-medium text-soft">
                  {review.location ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Poste actuel</dt>
                <dd className="font-medium text-soft">
                  {review.isCurrent ? "Oui" : "Non"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Recommandation</dt>
                <dd className="font-medium text-soft">
                  {review.recommend === null
                    ? "—"
                    : review.recommend
                      ? "Oui"
                      : "Non"}
                </dd>
              </div>
              {review.salaryReport ? (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Salaire</dt>
                  <dd className="font-medium text-soft">
                    {review.salaryReport.amount !== null
                      ? `${review.salaryReport.amount.toString()} ${review.salaryReport.currency}`
                      : "—"}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Établissement</dt>
                <dd className="truncate font-medium text-soft">
                  {review.establishment?.name ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Département</dt>
                <dd className="truncate font-medium text-soft">
                  {review.department?.name ?? "—"}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
