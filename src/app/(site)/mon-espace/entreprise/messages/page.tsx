import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompanyAvatar } from "@/components/CompanyAvatar";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(value);
}

export default async function CompanyMessagesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/mon-espace/entreprise/messages");
  }

  if (session.user.role !== "REPRESENTATIVE") {
    redirect("/mon-espace");
  }

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  });

  if (!account?.companyId) {
    redirect("/mon-espace/entreprise");
  }

  const company = await prisma.company.findUnique({
    where: { id: account.companyId },
    select: { id: true, name: true, logoUrl: true, logoPosition: true },
  });

  if (!company) {
    redirect("/mon-espace/entreprise");
  }

  const threads = await prisma.companyThread.findMany({
    where: { companyId: company.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: {
          messages: { where: { sender: "NEVALO", readAt: null } },
        },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-12">
      <nav
        aria-label="Fil d'Ariane"
        className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted"
      >
        <Link
          href="/mon-espace/entreprise"
          className="transition hover:text-ink"
        >
          Tableau de bord
        </Link>
        <span className="text-muted/40">/</span>
        <span className="text-ink">Messages</span>
      </nav>

      <header className="mt-6 flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CompanyAvatar
            name={company.name}
            logoUrl={company.logoUrl}
            logoPosition={company.logoPosition}
            size="h-12 w-12 text-base"
          />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Messages
            </h1>
            <p className="mt-1 text-sm text-soft">
              Vos discussions avec l&apos;équipe NEVALO.
            </p>
          </div>
        </div>

        <Link
          href="/mon-espace/entreprise/messages/nouveau"
          className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
        >
          Nouvelle requête
        </Link>
      </header>

      {threads.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="text-lg font-semibold text-ink">
            Aucune discussion pour le moment.
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-soft">
            Envoyez une nouvelle requête à l&apos;équipe NEVALO.
          </p>
          <Link
            href="/mon-espace/entreprise/messages/nouveau"
            className="mt-5 inline-block rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
          >
            Nouvelle requête
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {threads.map((thread) => {
            const last = thread.messages[0];
            const unread = thread._count.messages;
            return (
              <Link
                key={thread.id}
                href={`/mon-espace/entreprise/messages/${thread.id}`}
                className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5 transition hover:border-ink/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-ink">
                      {thread.subject}
                    </p>
                    {unread > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[11px] font-bold text-white">
                        {unread}
                      </span>
                    ) : null}
                  </div>
                  {last ? (
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {last.sender === "COMPANY" ? "Vous" : "NEVALO"} :{" "}
                      {last.content}
                    </p>
                  ) : null}
                </div>
                {last ? (
                  <span className="shrink-0 font-mono text-xs text-muted">
                    {formatDate(last.createdAt)}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
