import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { CompanyVerifiedBadge } from "@/components/CompanyVerifiedBadge";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

export default async function CompanyDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/mon-espace/entreprise");
  }

  if (session.user.role !== "REPRESENTATIVE") {
    redirect("/mon-espace");
  }

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  });

  if (!account?.companyId) {
    redirect("/mon-espace/parametres");
  }

  const company = await prisma.company.findUnique({
    where: { id: account.companyId },
    include: {
      reviews: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!company) {
    redirect("/mon-espace/parametres");
  }

  const companyHref = `/entreprises/${company.slug ?? company.id}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-12">
      <nav
        aria-label="Fil d'Ariane"
        className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted"
      >
        <span className="text-ink">Tableau de bord</span>
      </nav>

      <header className="mt-6 flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CompanyAvatar
            name={company.name}
            logoUrl={company.logoUrl}
            logoPosition={company.logoPosition}
            size="h-14 w-14 text-base"
          />
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {company.name}
              {company.claimed && company.verified ? (
                <CompanyVerifiedBadge className="h-5 w-5" />
              ) : null}
            </h1>
            <p className="mt-1 text-sm text-soft">
              {company.reviews.length === 0
                ? "Aucun avis reçu pour le moment."
                : company.reviews.length === 1
                  ? "1 avis reçu"
                  : `${company.reviews.length} avis reçus`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={companyHref}
            className="inline-flex items-center rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
          >
            Voir ma fiche
          </Link>
          <Link
            href="/mon-espace/entreprise/parametres"
            className="inline-flex items-center rounded-lg border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink"
          >
            Modifier ma fiche
          </Link>
        </div>
      </header>

      {company.reviews.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="text-lg font-semibold text-ink">
            Vous n&apos;avez pas encore reçu d&apos;avis.
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-soft">
            Les avis publiés sur votre entreprise apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {company.reviews.map((review) => {
            const date = review.publishedAt ?? review.createdAt;
            return (
              <Link
                key={review.id}
                href={`${companyHref}#avis-${review.id}`}
                className="block rounded-xl border border-line bg-surface p-6 transition hover:border-ink/30"
              >
                <span className="font-mono text-xs text-muted">
                  {formatDate(date)}
                </span>

                {review.positives ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-soft">
                    {review.positives}
                  </p>
                ) : review.negatives ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-soft">
                    {review.negatives}
                  </p>
                ) : null}

                <span className="mt-3 inline-block text-sm font-semibold text-accent">
                  Voir l&apos;avis →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
