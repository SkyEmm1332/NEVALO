import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { MonEspaceBanner } from "@/components/MonEspaceBanner";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

type CompanyReviewsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CompanyReviewsPage({
  params,
}: CompanyReviewsPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/mon-espace");
  }

  const { slug } = await params;

  const company = await prisma.company.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    select: { id: true, name: true, slug: true },
  });

  if (!company) {
    notFound();
  }

  const reviews = await prisma.review.findMany({
    where: {
      authorId: session.user.id,
      companyId: company.id,
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { likes: true, replies: true, responses: true },
      },
    },
  });

  const [totalReviews, totalHelpful] = await Promise.all([
    prisma.review.count({ where: { authorId: session.user.id } }),
    prisma.reviewLike.count({
      where: { review: { authorId: session.user.id } },
    }),
  ]);

  const companyHref = `/entreprises/${company.slug ?? company.id}`;

  return (
    <>
      <MonEspaceBanner
        name={session.user.name}
        email={session.user.email}
        reviewCount={totalReviews}
        helpfulCount={totalHelpful}
      />

      <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-12">
      <header className="flex items-center gap-4 border-b border-line pb-6">
        <CompanyAvatar
          name={company.name}
          size="h-14 w-14 shrink-0 text-base"
        />
        <div className="min-w-0">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {company.name}
          </h2>
          <p className="mt-1 text-sm text-soft">
            {reviews.length === 1
              ? "1 avis laissé"
              : `${reviews.length} avis laissés`}
          </p>
        </div>
      </header>

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line-strong bg-surface p-10 text-center">
          <p className="text-lg font-semibold text-ink">
            Vous n&apos;avez pas encore laissé d&apos;avis pour cette
            entreprise.
          </p>
          <Link
            href="/mon-espace"
            className="mt-4 inline-block font-mono text-xs text-accent transition hover:text-accent-deep"
          >
            Retour à mes avis →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => {
            const date = review.publishedAt ?? review.createdAt;
            const helpful = review._count.likes;
            const replyCount = review._count.replies + review._count.responses;

            return (
              <article
                key={review.id}
                className="rounded-xl border border-line bg-surface p-6"
              >
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
                  {review.jobTitle} · {formatDate(date)}
                </p>

                <div className="mt-4 space-y-3 text-sm leading-relaxed text-soft">
                  {review.positives ? (
                    <p>
                      <span className="font-bold uppercase tracking-wide text-accent">
                        Points positifs
                      </span>
                      <span className="mt-1 block">{review.positives}</span>
                    </p>
                  ) : null}
                  {review.negatives ? (
                    <p>
                      <span className="font-bold uppercase tracking-wide text-danger">
                        Points à améliorer
                      </span>
                      <span className="mt-1 block">{review.negatives}</span>
                    </p>
                  ) : null}
                  {review.comment ? <p>{review.comment}</p> : null}
                  {!review.positives &&
                  !review.negatives &&
                  !review.comment ? (
                    <p className="italic text-muted">Aucun message écrit.</p>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] text-muted">
                    <span>
                      {helpful === 0
                        ? "Pas encore jugé utile"
                        : helpful === 1
                          ? "1 personne a trouvé cet avis utile"
                          : `${helpful} personnes ont trouvé cet avis utile`}
                    </span>
                    <span>
                      {replyCount === 0
                        ? "Aucune réponse"
                        : replyCount === 1
                          ? "1 réponse"
                          : `${replyCount} réponses`}
                    </span>
                  </div>

                  <Link
                    href={`${companyHref}#avis-${review.id}`}
                    aria-label={`Voir cet avis sur la fiche de ${company.name}`}
                    className="ml-auto inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-soft"
                  >
                    Voir
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}
