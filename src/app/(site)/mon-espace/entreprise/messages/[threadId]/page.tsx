import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
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

export default async function CompanyThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ threadId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
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

  const { threadId } = await params;
  const thread = await prisma.companyThread.findFirst({
    where: { id: threadId, companyId: account.companyId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!thread) {
    notFound();
  }

  await prisma.companyMessage.updateMany({
    where: { threadId, sender: "NEVALO", readAt: null },
    data: { readAt: new Date() },
  });

  const sp = await searchParams;

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
        <Link
          href="/mon-espace/entreprise/messages"
          className="transition hover:text-ink"
        >
          Messages
        </Link>
        <span className="text-muted/40">/</span>
        <span className="truncate text-ink">{thread.subject}</span>
      </nav>

      <header className="mt-6 border-b border-line pb-6">
        <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {thread.subject}
        </h1>
      </header>

      {sp.error ? (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          Votre message est vide ou dépasse 2 000 caractères.
        </p>
      ) : null}

      <div className="mt-8 space-y-4">
        {thread.messages.map((message) => {
          const fromCompany = message.sender === "COMPANY";
          return (
            <div
              key={message.id}
              className={`flex ${fromCompany ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  fromCompany
                    ? "rounded-br-sm bg-accent text-white"
                    : "rounded-bl-sm bg-surface text-ink"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`mt-1 font-mono text-[10px] uppercase tracking-wide ${
                    fromCompany ? "text-white/70" : "text-muted"
                  }`}
                >
                  {fromCompany ? "Vous" : "NEVALO"} ·{" "}
                  {formatDate(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        action={replyCompanyThread}
        className="mt-8 rounded-xl border border-line bg-surface p-6"
      >
        <input type="hidden" name="threadId" value={thread.id} />
        <label
          htmlFor="company-reply"
          className="font-mono text-xs uppercase tracking-[0.16em] text-muted"
        >
          Votre message
        </label>
        <textarea
          id="company-reply"
          name="content"
          rows={4}
          maxLength={2000}
          placeholder="Écrivez votre message..."
          className="mt-2 w-full resize-y rounded-lg border border-line bg-paper px-3 py-2 text-sm leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-accent"
        />
        <div className="mt-4 flex items-center justify-end">
          <button
            type="submit"
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}
