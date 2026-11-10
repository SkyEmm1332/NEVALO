import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const REVIEW_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  IN_VERIFICATION: "En vérification",
  VERIFIED: "Vérifié",
  UNVERIFIED: "Non vérifié",
  IN_MODERATION: "En modération",
  PUBLISHED: "Publié",
  REJECTED: "Rejeté",
  CONTESTED: "Contesté",
};

export default async function MonEspacePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const reviews = await prisma.review.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { company: { select: { id: true, name: true, slug: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-14">
      <div className="flex flex-col items-start justify-between gap-4 border-b-2 border-ink pb-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Registre · Espace personnel
          </p>
          <h1 className="mt-2 text-4xl font-extrabold uppercase tracking-tight text-ink">
            Mon espace
          </h1>
          <p className="mt-1 font-mono text-sm text-muted">{session.user.email}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/deposer-avis"
            className="border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
          >
            Déposer un avis
          </Link>
          <Link
            href="/proposer-entreprise"
            className="border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink"
          >
            Proposer une entreprise
          </Link>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Mes avis
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-4 border border-dashed border-line-strong bg-surface p-12 text-center text-muted">
            Vous n&apos;avez pas encore déposé d&apos;avis.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line border border-line bg-surface">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-bold text-ink">{r.company.name}</p>
                  <p className="font-mono text-xs uppercase tracking-wide text-muted">
                    {r.jobTitle} ·{" "}
                    {REVIEW_STATUS_LABEL[r.status] ?? r.status}
                  </p>
                </div>
                <Link
                  href={`/entreprises/${r.company.slug ?? r.company.id}`}
                  className="font-mono text-sm text-accent transition hover:text-accent-deep"
                >
                  Voir →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
