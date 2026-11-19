import Link from "next/link";
import type { CompanyStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { setCompanyStatus } from "@/app/admin/actions";
import { AdminCompanyCreateForm } from "@/components/admin/AdminCompanyCreateForm";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminSummary } from "@/components/admin/AdminSummary";
import {
  ADMIN_INPUT_CLASS,
  ADMIN_LABEL_CLASS,
  COMPANY_STATUS_META,
  adminInitial,
} from "@/lib/admin-ui";
import {
  ADMIN_PAGE_SIZE,
  adminPage,
  adminParam,
  type AdminSearchParams,
} from "@/lib/admin-search";

const STATUS_FILTERS: CompanyStatus[] = ["PUBLISHED", "PENDING", "REJECTED"];

function CompanyActions({
  id,
  status,
  alignEnd = false,
}: {
  id: string;
  status: CompanyStatus;
  alignEnd?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${alignEnd ? "justify-end" : ""}`}>
      <Link
        href={`/admin/entreprises/${id}`}
        className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-medium text-soft transition hover:bg-line"
      >
        Modifier
      </Link>
      {status !== "PUBLISHED" ? (
        <form action={setCompanyStatus}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            name="status"
            value="PUBLISHED"
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-deep"
          >
            Publier
          </button>
        </form>
      ) : (
        <form action={setCompanyStatus}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            name="status"
            value="PENDING"
            className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-medium text-soft transition hover:bg-line"
          >
            Masquer
          </button>
        </form>
      )}
      {status !== "REJECTED" ? (
        <form action={setCompanyStatus}>
          <input type="hidden" name="id" value={id} />
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
  );
}

type AdminCompaniesPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

export default async function AdminCompaniesPage({
  searchParams,
}: AdminCompaniesPageProps) {
  const params = await searchParams;
  const q = adminParam(params, "q");
  const status = adminParam(params, "status");
  const statusFilter = STATUS_FILTERS.includes(status as CompanyStatus)
    ? (status as CompanyStatus)
    : null;
  const requestedPage = adminPage(params);

  const where: Prisma.CompanyWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { sector: { contains: q, mode: "insensitive" } },
    ];
  }

  if (statusFilter) {
    where.status = statusFilter;
  }

  const [total, pendingCount, publishedCount, withoutReviewsCount] =
    await Promise.all([
      prisma.company.count({ where }),
      prisma.company.count({
        where: { AND: [where, { status: "PENDING" }] },
      }),
      prisma.company.count({
        where: { AND: [where, { status: "PUBLISHED" }] },
      }),
      prisma.company.count({
        where: { AND: [where, { reviews: { none: {} } }] },
      }),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const companies = await prisma.company.findMany({
    where,
    orderBy: [{ status: "asc" }, { name: "asc" }],
    skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
    include: { _count: { select: { reviews: true } } },
  });

  const hasFilters = Boolean(q || statusFilter);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Entreprises"
        description="Validez, rejetez ou créez des fiches entreprises."
        badge={
          pendingCount > 0
            ? { label: `${pendingCount} en attente`, tone: "gold" }
            : undefined
        }
      />

      <AdminSummary
        items={[
          {
            label: "Fiches",
            value: total,
            detail: hasFilters ? "Vue filtrée" : "Registre complet",
            tone: "ink",
          },
          {
            label: "En attente",
            value: pendingCount,
            detail: "À valider",
            tone: "gold",
          },
          {
            label: "Publiées",
            value: publishedCount,
            detail: "Visibles publiquement",
            tone: "accent",
          },
          {
            label: "Sans avis",
            value: withoutReviewsCount,
            detail: "Sans retour client",
            tone: "blue",
          },
        ]}
      />

      <AdminCompanyCreateForm />

      <AdminFilterBar
        action="/admin/entreprises"
        resetHref="/admin/entreprises"
        hasFilters={hasFilters}
      >
        <label className="flex-1">
          <span className={ADMIN_LABEL_CLASS}>Rechercher</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom, ville ou secteur"
            className={ADMIN_INPUT_CLASS}
          />
        </label>
        <label className="sm:w-52">
          <span className={ADMIN_LABEL_CLASS}>Statut</span>
          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            className={ADMIN_INPUT_CLASS}
          >
            <option value="">Tous les statuts</option>
            {STATUS_FILTERS.map((item) => (
              <option key={item} value={item}>
                {COMPANY_STATUS_META[item].label}
              </option>
            ))}
          </select>
        </label>
      </AdminFilterBar>

      <section className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Entreprise</th>
                <th className="px-4 py-3 font-medium">Ville</th>
                <th className="px-4 py-3 font-medium">Avis</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {companies.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-muted"
                  >
                    Aucune entreprise ne correspond à ces filtres.
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const companyStatus = COMPANY_STATUS_META[company.status];

                  return (
                    <tr
                      key={company.id}
                      className="align-middle transition hover:bg-paper/70"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 font-mono text-xs font-semibold text-[#96680f]">
                            {adminInitial(company.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {company.name}
                            </p>
                            <p className="truncate text-xs text-muted">
                              {company.sector ?? "Secteur non renseigné"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {company.city ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm tabular text-soft">
                          {company._count.reviews}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <AdminStatusBadge
                          label={companyStatus.label}
                          tone={companyStatus.tone}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <CompanyActions
                          id={company.id}
                          status={company.status}
                          alignEnd
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-line md:hidden">
          {companies.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Aucune entreprise ne correspond à ces filtres.
            </p>
          ) : (
            companies.map((company) => {
              const companyStatus = COMPANY_STATUS_META[company.status];

              return (
                <div key={company.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 font-mono text-xs font-semibold text-[#96680f]">
                      {adminInitial(company.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">
                            {company.name}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {company.sector ?? "Secteur non renseigné"}
                          </p>
                        </div>
                        <AdminStatusBadge
                          label={companyStatus.label}
                          tone={companyStatus.tone}
                          className="shrink-0"
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {company.city ?? "—"} · {company._count.reviews} avis
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <CompanyActions
                      id={company.id}
                      status={company.status}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <AdminPagination
          basePath="/admin/entreprises"
          page={currentPage}
          totalPages={totalPages}
          totalItems={total}
          labels={{ singular: "entreprise", plural: "entreprises" }}
          query={{ q, status: statusFilter ?? "" }}
        />
      </section>
    </div>
  );
}
