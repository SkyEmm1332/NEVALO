import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { replyCompanyThread } from "../actions";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function shortDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(value);
}

export default async function AdminRequeteThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ threadId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { threadId } = await params;
  const thread = await prisma.companyThread.findUnique({
    where: { id: threadId },
    include: {
      company: { select: { name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!thread) {
    notFound();
  }

  const [companyThreads] = await Promise.all([
    prisma.companyThread.findMany({
      where: { companyId: thread.companyId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: {
          select: {
            messages: { where: { sender: "COMPANY", readAt: null } },
          },
        },
      },
    }),
    prisma.companyMessage.updateMany({
      where: { threadId, sender: "COMPANY", readAt: null },
      data: { readAt: new Date() },
    }),
  ]);

  const sp = await searchParams;

  return (
    <div className="space-y-5">
      <nav
        aria-label="Fil d'Ariane"
        className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted"
      >
        <Link href="/admin/requetes" className="transition hover:text-ink">
          Requêtes
        </Link>
        <span className="text-muted/40">/</span>
        <span className="text-ink">{thread.company.name}</span>
        <span className="text-muted/40">/</span>
        <span className="truncate text-ink">{thread.subject}</span>
      </nav>

      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <aside className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line px-4 py-3">
            <p className="font-semibold text-ink">Requêtes de l&apos;entreprise</p>
            <p className="mt-0.5 text-xs text-muted">{thread.company.name}</p>
          </div>
          <ul className="max-h-[70vh] divide-y divide-line overflow-auto">
            {companyThreads.map((item) => {
              const active = item.id === thread.id;
              const last = item.messages[0];
              const unread = item._count.messages;
              return (
                <li key={item.id}>
                  <Link
                    href={`/admin/requetes/${item.id}`}
                    className={`block px-4 py-3 transition ${
                      active ? "bg-accent/10" : "hover:bg-paper"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink">
                        {item.subject}
                      </p>
                      {unread > 0 ? (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-bold text-white">
                          {unread}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {last ? last.content : "Sans message"}
                    </p>
                    {last ? (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">
                        {shortDate(last.createdAt)}
                      </p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <header className="border-b border-line bg-paper/60 px-5 py-3">
            <h1 className="truncate text-lg font-bold text-ink">
              {thread.subject}
            </h1>
          </header>

          {sp.error ? (
            <p className="border-b border-danger/30 bg-danger/10 px-5 py-3 text-sm font-medium text-danger">
              Votre message est vide ou dépasse 2 000 caractères.
            </p>
          ) : null}

          <div className="space-y-4 bg-paper p-5">
            {thread.messages.map((message) => {
              const fromCompany = message.sender === "COMPANY";
              return (
                <div
                  key={message.id}
                  className={`flex ${fromCompany ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      fromCompany
                        ? "rounded-bl-sm border border-line bg-surface text-ink"
                        : "rounded-br-sm bg-accent text-white"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`mt-1 font-mono text-[10px] uppercase tracking-wide ${
                        fromCompany ? "text-muted" : "text-white/70"
                      }`}
                    >
                      {fromCompany ? "Entreprise" : "NEVALO"} ·{" "}
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            action={replyCompanyThread}
            className="flex items-end gap-3 border-t border-line p-4"
          >
            <input type="hidden" name="threadId" value={thread.id} />
            <textarea
              id="admin-reply"
              name="content"
              rows={2}
              maxLength={2000}
              placeholder="Répondre à l'entreprise..."
              className="min-h-[52px] flex-1 resize-y rounded-lg border border-line bg-paper px-3 py-2 text-sm leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-accent"
            />
            <button
              type="submit"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep"
            >
              Envoyer
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
