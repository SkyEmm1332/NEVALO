import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { markMessageRead } from "../actions";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminSummary } from "@/components/admin/AdminSummary";
import {
  ADMIN_INPUT_CLASS,
  ADMIN_LABEL_CLASS,
  adminInitial,
  formatAdminDate,
} from "@/lib/admin-ui";
import {
  ADMIN_PAGE_SIZE,
  adminPage,
  adminParam,
  type AdminSearchParams,
} from "@/lib/admin-search";

type AdminMessagesPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

export default async function AdminMessagesPage({
  searchParams,
}: AdminMessagesPageProps) {
  const params = await searchParams;
  const q = adminParam(params, "q");
  const read = adminParam(params, "read");
  const readFilter =
    read === "unread" ? false : read === "read" ? true : null;
  const requestedPage = adminPage(params);

  const where: Prisma.ContactMessageWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  if (readFilter !== null) {
    where.read = readFilter;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [total, unread, readCount, todayCount] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({
      where: { AND: [where, { read: false }] },
    }),
    prisma.contactMessage.count({
      where: { AND: [where, { read: true }] },
    }),
    prisma.contactMessage.count({
      where: { AND: [where, { createdAt: { gte: startOfToday } }] },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  const hasFilters = Boolean(q || readFilter !== null);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Messages"
        description="Demandes reçues via le formulaire de contact."
        badge={
          unread > 0
            ? {
                label: `${unread} non lu${unread > 1 ? "s" : ""}`,
                tone: "blue",
              }
            : undefined
        }
      />

      <AdminSummary
        items={[
          {
            label: "Messages",
            value: total,
            detail: hasFilters ? "Vue filtrée" : "Boîte de réception",
            tone: "ink",
          },
          {
            label: "Non lus",
            value: unread,
            detail: "À ouvrir",
            tone: "blue",
          },
          {
            label: "Lus",
            value: readCount,
            detail: "Déjà traités",
            tone: "accent",
          },
          {
            label: "Aujourd’hui",
            value: todayCount,
            detail: "Reçus ce jour",
            tone: "gold",
          },
        ]}
      />

      <AdminFilterBar
        action="/admin/messages"
        resetHref="/admin/messages"
        hasFilters={hasFilters}
      >
        <label className="flex-1">
          <span className={ADMIN_LABEL_CLASS}>Rechercher</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom, email, objet ou contenu"
            className={ADMIN_INPUT_CLASS}
          />
        </label>
        <label className="sm:w-48">
          <span className={ADMIN_LABEL_CLASS}>Lecture</span>
          <select
            name="read"
            defaultValue={
              readFilter === null ? "" : readFilter ? "read" : "unread"
            }
            className={ADMIN_INPUT_CLASS}
          >
            <option value="">Tous les messages</option>
            <option value="unread">Non lus</option>
            <option value="read">Lus</option>
          </select>
        </label>
      </AdminFilterBar>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <AdminEmptyState
            title="Aucun message ne correspond à ces filtres."
            description="Modifiez la recherche ou l’état de lecture."
          />
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={`relative overflow-hidden rounded-lg border bg-surface p-5 ${
                message.read ? "border-line" : "border-blue/30"
              }`}
            >
              {!message.read ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1 bg-blue"
                />
              ) : null}

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue/10 font-mono text-xs font-semibold text-blue">
                    {adminInitial(message.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-ink">
                        {message.subject ?? "Sans objet"}
                      </p>
                      {!message.read ? (
                        <span
                          aria-label="Non lu"
                          className="h-2 w-2 shrink-0 rounded-full bg-blue"
                        />
                      ) : null}
                    </div>
                    <p className="text-xs text-muted">
                      {message.name} ·{" "}
                      <a
                        href={`mailto:${message.email}`}
                        className="text-accent hover:underline"
                      >
                        {message.email}
                      </a>
                      {message.phone ? (
                        <>
                          {" · "}
                          <a
                            href={`tel:${message.phone.replace(/\s/g, "")}`}
                            className="text-accent hover:underline"
                          >
                            {message.phone}
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted">
                    {formatAdminDate(message.createdAt)}
                  </span>
                  {message.read ? (
                    <AdminStatusBadge label="Lu" tone="muted" />
                  ) : (
                    <form action={markMessageRead}>
                      <input type="hidden" name="id" value={message.id} />
                      <button
                        type="submit"
                        className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white transition hover:bg-accent-deep"
                      >
                        Marquer lu
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-soft">
                {message.message}
              </p>
            </article>
          ))
        )}
      </div>

      <AdminPagination
        basePath="/admin/messages"
        page={currentPage}
        totalPages={totalPages}
        totalItems={total}
        labels={{ singular: "message", plural: "messages" }}
        query={{
          q,
          read: readFilter === null ? "" : readFilter ? "read" : "unread",
        }}
        className="rounded-lg border border-line"
      />
    </div>
  );
}
