import { prisma } from "@/lib/prisma";
import { setReviewStatus } from "@/app/admin/actions";
import type { ReviewStatus } from "@prisma/client";

const STATUS_LABEL: Record<ReviewStatus, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-paper text-soft" },
  IN_VERIFICATION: { label: "En vérification", className: "bg-blue/10 text-blue" },
  VERIFIED: { label: "Vérifié", className: "bg-accent/10 text-accent" },
  UNVERIFIED: { label: "Non vérifié", className: "bg-gold/15 text-[#96680f]" },
  IN_MODERATION: { label: "En modération", className: "bg-accent/10 text-accent" },
  PUBLISHED: { label: "Publié", className: "bg-accent/10 text-accent" },
  REJECTED: { label: "Rejeté", className: "bg-danger/10 text-danger" },
  CONTESTED: { label: "Contesté", className: "bg-gold/15 text-[#96680f]" },
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
      <p className="mt-1 text-sm text-muted">
        Modérez les témoignages publiés sur la plateforme.
      </p>

      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-strong bg-surface p-8 text-center text-muted">
            Aucun avis pour le moment.
          </p>
        ) : (
          reviews.map((r) => {
            const status = STATUS_LABEL[r.status] ?? STATUS_LABEL.DRAFT;
            return (
              <article
                key={r.id}
                className="rounded-lg border border-line bg-surface p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{r.company.name}</span>
                    <span className="ml-2 text-sm text-muted">
                      {r.jobTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      {VISIBILITY_LABEL[r.visibility]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                <p className="mt-1 text-xs text-muted">
                  {r.author.email} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                </p>

                {r.positives ? (
                  <p className="mt-3 text-sm text-soft">
                    <span className="font-medium text-accent">+ </span>
                    {r.positives}
                  </p>
                ) : null}
                {r.negatives ? (
                  <p className="mt-1 text-sm text-soft">
                    <span className="font-medium text-danger">− </span>
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
                        className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-deep"
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
                        className="rounded-md border border-danger/30 bg-danger/5 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
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
