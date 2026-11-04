import { prisma } from "@/lib/prisma";
import { markMessageRead } from "../actions";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages de contact</h1>
          <p className="mt-1 text-sm text-slate-400">
            {messages.length} message{messages.length > 1 ? "s" : ""} ·{" "}
            {unread} non lu{unread > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {messages.length === 0 ? (
          <p className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
            Aucun message pour le moment.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg border p-5 ${
                m.read
                  ? "border-slate-800 bg-slate-900"
                  : "border-indigo-500/40 bg-slate-900"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {m.subject ?? "Sans objet"}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {m.name} ·{" "}
                    <a
                      href={`mailto:${m.email}`}
                      className="text-indigo-300 hover:underline"
                    >
                      {m.email}
                    </a>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-500">
                    {m.createdAt.toLocaleDateString("fr-FR")}
                  </span>
                  {m.read ? (
                    <span className="rounded-sm bg-slate-800 px-2 py-1 font-mono text-[11px] uppercase text-slate-400">
                      Lu
                    </span>
                  ) : (
                    <form action={markMessageRead}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="rounded-sm bg-indigo-600 px-2 py-1 font-mono text-[11px] uppercase text-white transition hover:bg-indigo-500"
                      >
                        Marquer lu
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {m.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
