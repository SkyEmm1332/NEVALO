import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminSummary } from "@/components/admin/AdminSummary";
import {
  ADMIN_INPUT_CLASS,
  ADMIN_LABEL_CLASS,
  formatAdminDate,
} from "@/lib/admin-ui";
import {
  adminParam,
  type AdminSearchParams,
} from "@/lib/admin-search";

type AdminRequetesPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

export default async function AdminRequetesPage({
  searchParams,
}: AdminRequetesPageProps) {
  const params = await searchParams;
  const q = adminParam(params, "q");

  const where: Prisma.CompanyThreadWhereInput = {};

  if (q) {
    where.OR = [
      { subject: { contains: q, mode: "insensitive" } },
      { company: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [total, unread, companyCount, todayCount] = await Promise.all([
    prisma.companyThread.count({ where }),
    prisma.companyMessage.count({ where: { sender: "COMPANY", readAt: null } }),
    prisma.company.count({ where: { threads: { some: {} } } }),
    prisma.companyThread.count({
      where: { AND: [where, { updatedAt: { gte: startOfToday } }] },
    }),
  ]);

  const threads = await prisma.companyThread.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      company: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: {
          messages: { where: { sender: "COMPANY", readAt: null } },
        },
      },
    },
  });

  const hasFilters = Boolean(q);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Requêtes"
        description="Discussions entre les entreprises et NEVALO."
        badge={
          unread > 0
            ? { label: `${unread} non lu${unread > 1 ? "s" : ""}`, tone: "blue" }
            : undefined
        }
      />

      <AdminSummary
        items={[
          {
            label: "Conversations",
            value: total,
            detail: hasFilters ? "Vue filtrée" : "Toutes les requêtes",
            tone: "ink",
          },
          {
            label: "Non lus",
            value: unread,
            detail: "Messages entreprise à traiter",
            tone: "blue",
          },
          {
            label: "Entreprises",
            value: companyCount,
            detail: "Ayant engagé une discussion",
            tone: "accent",
          },
          {
            label: "Aujourd'hui",
            value: todayCount,
            detail: "Actives ce jour",
            tone: "gold",
          },
        ]}
      />

      <AdminFilterBar
        action="/admin/requetes"
        resetHref="/admin/requetes"
        hasFilters={hasFilters}
      >
        <label className="flex-1">
          <span className={ADMIN_LABEL_CLASS}>Rechercher</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Objet ou entreprise"
            className={ADMIN_INPUT_CLASS}
          />
        </label>
      </AdminFilterBar>

      {threads.length === 0 ? (
        <AdminEmptyState
          title={hasFilters ? "Aucune requête ne correspond" : "Aucune requête"}
          description={
            hasFilters
              ? "Essayez un autre terme de recherche."
              : "Les demandes des entreprises apparaîtront ici."
          }
        />
      ) : (
        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Objet</th>
                  <th className="px-4 py-3 font-medium">Entreprise</th>
                  <th className="px-4 py-3 font-medium">Dernier message</th>
                  <th className="px-4 py-3 font-medium">Non lu</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {threads.map((thread) => {
                  const last = thread.messages[0];
                  const unread = thread._count.messages;
                  return (
                    <tr key={thread.id} className="transition hover:bg-paper">
                      <td className="max-w-[16rem] px-4 py-3">
                        <p className="truncate font-semibold text-ink">
                          {thread.subject}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-soft">
                        {thread.company.name}
                      </td>
                      <td className="max-w-[20rem] px-4 py-3">
                        <p className="truncate text-soft">
                          {last ? last.content : "Sans message"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {unread > 0 ? (
                          <AdminStatusBadge label={`${unread}`} tone="blue" />
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {last ? formatAdminDate(last.createdAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/requetes/${thread.id}`}
                          className="inline-block rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-medium text-soft transition hover:bg-line"
                        >
                          Ouvrir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
