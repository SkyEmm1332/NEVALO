import { prisma } from "@/lib/prisma";
import { setReviewStatus } from "@/app/admin/actions";
import type { ReviewStatus } from "@prisma/client";

const STATUS_LABEL: Record<ReviewStatus, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-slate-100 text-slate-600" },
  IN_VERIFICATION: { label: "En vérification", className: "bg-blue-50 text-blue-700" },
  VERIFIED: { label: "Vérifié", className: "bg-emerald-50 text-emerald-700" },
  UNVERIFIED: { label: "Non vérifié", className: "bg-amber-50 text-amber-700" },
  IN_MODERATION: { label: "En modération", className: "bg-purple-50 text-purple-700" },
  PUBLISHED: { label: "Publié", className: "bg-emerald-50 text-emerald-700" },
  REJECTED: { label: "Rejeté", className: "bg-rose-50 text-rose-700" },
  CONTESTED: { label: "Contesté", className: "bg-orange-50 text-orange-700" },
};

const VISIBILITY_LABEL: Record<string, string> = {
  ANONYMOUS: "Anonyme",
  PSEUDONYM: "Pseudonyme",
  NOMINATIVE: "Nominatif",
};

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true } },
      author: { select: { email: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Avis &amp; modération</h1>
      <p className="mt-1 text-sm text-slate-500">
        Modérez les témoignages publiés sur la plateforme.
      </p>

      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Aucun avis pour le moment.
          </p>
        ) : (
          reviews.map((r) => {
            const status = STATUS_LABEL[r.status] ?? STATUS_LABEL.DRAFT;
            return (
              <article
                key={r.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{r.company.name}</span>
                    <span className="ml-2 text-sm text-slate-500">
                      {r.jobTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {VISIBILITY_LABEL[r.visibility]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {r.author.email} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                </p>

                {r.positives ? (
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-medium text-emerald-600">+ </span>
                    {r.positives}
                  </p>
                ) : null}
                {r.negatives ? (
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-medium text-rose-600">− </span>
                    {r.negatives}
                  </p>
                ) : null}

                <div className="mt-4 flex gap-2">
                  {r.status !== "PUBLISHED" ? (
                    <form action={setReviewStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        name="status"
                        value="PUBLISHED"
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                      >
                        Publier
                      </button>
                    </form>
                  ) : null}
                  {r.status !== "REJECTED" ? (
                    <form action={setReviewStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        name="status"
                        value="REJECTED"
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100"
                      >
                        Rejeter
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
