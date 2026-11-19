import type { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { setUserRole } from "@/app/admin/actions";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminSummary } from "@/components/admin/AdminSummary";
import {
  ADMIN_INPUT_CLASS,
  ADMIN_LABEL_CLASS,
  USER_ROLE_META,
  USER_ROLES,
  adminInitial,
} from "@/lib/admin-ui";
import {
  ADMIN_PAGE_SIZE,
  adminPage,
  adminParam,
  type AdminSearchParams,
} from "@/lib/admin-search";

function UserRoleForm({ id, role }: { id: string; role: UserRole }) {
  return (
    <form action={setUserRole} className="flex gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="role"
        defaultValue={role}
        className="rounded-md border border-line-strong px-2 py-1.5 text-xs outline-none focus:border-accent"
      >
        {USER_ROLES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-deep"
      >
        Appliquer
      </button>
    </form>
  );
}

type AdminUsersPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;
  const q = adminParam(params, "q");
  const role = adminParam(params, "role");
  const roleFilter = USER_ROLES.some((item) => item.value === role)
    ? (role as UserRole)
    : null;
  const requestedPage = adminPage(params);

  const where: Prisma.UserWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  if (roleFilter) {
    where.role = roleFilter;
  }

  const [
    total,
    adminCount,
    moderatorCount,
    contributorCount,
    representativeCount,
  ] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.count({ where: { AND: [where, { role: "ADMIN" }] } }),
    prisma.user.count({ where: { AND: [where, { role: "MODERATOR" }] } }),
    prisma.user.count({ where: { AND: [where, { role: "CONTRIBUTOR" }] } }),
    prisma.user.count({ where: { AND: [where, { role: "REPRESENTATIVE" }] } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "asc" },
    skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
    include: { _count: { select: { reviews: true } } },
  });

  const hasFilters = Boolean(q || roleFilter);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Utilisateurs"
        description="Gérez les comptes et les rôles d’accès."
      />

      <AdminSummary
        items={[
          {
            label: "Comptes",
            value: total,
            detail: hasFilters ? "Vue filtrée" : "Tous les utilisateurs",
            tone: "ink",
          },
          {
            label: "Équipe admin",
            value: adminCount + moderatorCount,
            detail: `${adminCount} admin · ${moderatorCount} modérateur${moderatorCount > 1 ? "s" : ""}`,
            tone: "blue",
          },
          {
            label: "Contributeurs",
            value: contributorCount,
            detail: "Comptes membres",
            tone: "accent",
          },
          {
            label: "Représentants",
            value: representativeCount,
            detail: "Comptes entreprises",
            tone: "gold",
          },
        ]}
      />

      <AdminFilterBar
        action="/admin/utilisateurs"
        resetHref="/admin/utilisateurs"
        hasFilters={hasFilters}
      >
        <label className="flex-1">
          <span className={ADMIN_LABEL_CLASS}>Rechercher</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom ou email"
            className={ADMIN_INPUT_CLASS}
          />
        </label>
        <label className="sm:w-52">
          <span className={ADMIN_LABEL_CLASS}>Rôle</span>
          <select
            name="role"
            defaultValue={roleFilter ?? ""}
            className={ADMIN_INPUT_CLASS}
          >
            <option value="">Tous les rôles</option>
            {USER_ROLES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
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
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Avis</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="px-4 py-3 font-medium">Changer le rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm text-muted"
                  >
                    Aucun utilisateur ne correspond à ces filtres.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleMeta = USER_ROLE_META[user.role];

                  return (
                    <tr
                      key={user.id}
                      className="align-middle transition hover:bg-paper/70"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/5 font-mono text-xs font-semibold text-ink">
                            {adminInitial(user.name ?? user.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {user.name ?? "—"}
                            </p>
                            <p className="truncate text-xs text-muted">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm tabular text-soft">
                          {user._count.reviews}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <AdminStatusBadge
                          label={roleMeta.label}
                          tone={roleMeta.tone}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <UserRoleForm id={user.id} role={user.role} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-line md:hidden">
          {users.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Aucun utilisateur ne correspond à ces filtres.
            </p>
          ) : (
            users.map((user) => {
              const roleMeta = USER_ROLE_META[user.role];

              return (
                <div key={user.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5 font-mono text-xs font-semibold text-ink">
                      {adminInitial(user.name ?? user.email)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">{user.name ?? "—"}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <AdminStatusBadge
                          label={roleMeta.label}
                          tone={roleMeta.tone}
                        />
                        <span className="text-xs text-muted">
                          {user._count.reviews} avis
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <UserRoleForm id={user.id} role={user.role} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <AdminPagination
          basePath="/admin/utilisateurs"
          page={currentPage}
          totalPages={totalPages}
          totalItems={total}
          labels={{ singular: "utilisateur", plural: "utilisateurs" }}
          query={{ q, role: roleFilter ?? "" }}
        />
      </section>
    </div>
  );
}
