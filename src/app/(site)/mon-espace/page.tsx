import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { MonEspaceBanner } from "@/components/MonEspaceBanner";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

type MonEspacePageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function MonEspacePage({
  searchParams,
}: MonEspacePageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/mon-espace");
  }

  if (session.user.role === "REPRESENTATIVE") {
    redirect("/mon-espace/entreprise");
  }

  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";

  const reviews = await prisma.review.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { id: true, name: true, slug: true } },
      _count: { select: { likes: true } },
    },
  });

  const totalHelpful = reviews.reduce(
    (total, review) => total + review._count.likes,
    0,
  );

  const normalizedQuery = normalize(q);
  const filteredReviews = normalizedQuery
    ? reviews.filter((review) =>
        normalize(review.company.name).includes(normalizedQuery),
      )
    : reviews;

  const companyGroups = new Map<
    string,
    { company: (typeof reviews)[number]["company"]; count: number }
  >();

  for (const review of filteredReviews) {
    const group = companyGroups.get(review.company.id);
    if (group) {
      group.count += 1;
    } else {
      companyGroups.set(review.company.id, {
        company: review.company,
        count: 1,
      });
    }
  }

  return (
    <>
      <MonEspaceBanner
        name={session.user.name}
        email={session.user.email}
        reviewCount={reviews.length}
        helpfulCount={totalHelpful}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-12">
        <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Mes avis
            </h2>
            <p className="mt-1 text-sm text-soft">
              Ouvrez une entreprise pour consulter vos avis.
            </p>
          </div>
          {reviews.length > 0 ? (
            <form
              role="search"
              action="/mon-espace"
              method="get"
              className="relative w-full sm:w-72"
            >
              <label htmlFor="review-search" className="sr-only">
                Rechercher une entreprise dans mes avis
              </label>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="review-search"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Rechercher une entreprise"
                className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </form>
          ) : null}
        </div>

        {reviews.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-line-strong bg-surface p-10 text-center">
            <p className="text-lg font-semibold text-ink">
              Vous n&apos;avez pas encore laissé d&apos;avis.
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-soft">
              Partagez une expérience professionnelle pour aider les autres à
              choisir un employeur.
            </p>
            <Link
              href="/deposer-avis"
              className="mt-5 inline-block rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
            >
              Déposer un avis
            </Link>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-line-strong bg-surface p-8 text-center">
            <p className="text-base font-semibold text-ink">
              Aucun avis pour « {q} ».
            </p>
            <p className="mt-1 text-sm text-soft">
              Essayez un autre nom d&apos;entreprise.
            </p>
            <Link
              href="/mon-espace"
              className="mt-4 inline-block font-mono text-xs text-accent transition hover:text-accent-deep"
            >
              Voir toutes mes entreprises →
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {Array.from(companyGroups.values()).map(({ company, count }) => {
              const companyHref = `/mon-espace/entreprise/${company.slug ?? company.id}`;

              return (
                <Link
                  key={company.id}
                  href={companyHref}
                  aria-label={`Voir mes avis sur ${company.name}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-5 py-4 transition hover:border-line-strong hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <CompanyAvatar
                      name={company.name}
                      size="h-10 w-10 shrink-0 text-xs"
                    />
                    <div className="min-w-0">
                      <p
                        className="truncate font-semibold text-ink"
                        title={company.name}
                      >
                        {company.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                        {count} avis
                      </p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-accent transition group-hover:text-accent-deep">
                    <span className="hidden sm:inline">Voir mes avis</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
