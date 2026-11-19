"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Stars } from "@/components/Stars";
import { ReviewSocial } from "@/components/ReviewSocial";
import { CompanyVerifiedBadge } from "@/components/CompanyVerifiedBadge";
import {
  CompanyResponseForm,
  type CompanyResponse,
} from "@/components/CompanyResponseForm";
import { scoreToFloatStars } from "@/lib/rating";

export type CompanyReviewItem = {
  id: string;
  score: number | null;
  isCurrent: boolean;
  startDate: string | null;
  endDate: string | null;
  contractType: string | null;
  recommend: boolean | null;
  visibility: "ANONYMOUS" | "PSEUDONYM" | "NOMINATIVE";
  jobTitle: string;
  location: string | null;
  positives: string | null;
  negatives: string | null;
  publishedAt: string | null;
  authorName: string;
  verified: boolean;
  canReport: boolean;
  responses: {
    id: string;
    content: string;
    createdAt: string;
  }[];
  likes: { userId: string }[];
  replies: {
    id: string;
    content: string;
    createdAt: string;
    authorName: string | null;
  }[];
};

type SortValue = "recent" | "best" | "worst";
type StatusValue = "all" | "current" | "former";
type RecommendValue = "all" | "yes" | "no";

function isSortValue(value: string): value is SortValue {
  return value === "recent" || value === "best" || value === "worst";
}

function isStatusValue(value: string): value is StatusValue {
  return value === "all" || value === "current" || value === "former";
}

function isRecommendValue(value: string): value is RecommendValue {
  return value === "all" || value === "yes" || value === "no";
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatPeriod(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) return null;
  if (startDate && endDate) {
    return `${formatMonth(startDate)} – ${formatMonth(endDate)}`;
  }
  if (startDate) return `Depuis ${formatMonth(startDate)}`;
  return `Jusqu'à ${formatMonth(endDate as string)}`;
}

export function CompanyReviews({
  reviews,
  slug,
  initialSort,
  initialStatus,
  initialRecommend,
  currentUserId,
  isAuthenticated,
  hideReviewCta = false,
  companyVerified = false,
  canRespondAsCompany = false,
}: {
  reviews: CompanyReviewItem[];
  slug: string;
  initialSort: string;
  initialStatus: string;
  initialRecommend: string;
  currentUserId: string | null;
  isAuthenticated: boolean;
  hideReviewCta?: boolean;
  companyVerified?: boolean;
  canRespondAsCompany?: boolean;
}) {
  const [sort, setSort] = useState<SortValue>(
    isSortValue(initialSort) ? initialSort : "recent",
  );
  const [status, setStatus] = useState<StatusValue>(
    isStatusValue(initialStatus) ? initialStatus : "all",
  );
  const [recommend, setRecommend] = useState<RecommendValue>(
    isRecommendValue(initialRecommend) ? initialRecommend : "all",
  );
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [extraResponses, setExtraResponses] = useState<
    Record<string, CompanyResponse[]>
  >({});

  useEffect(() => {
    function syncHighlightedReview() {
      const hash = window.location.hash;
      setHighlightedId(
        hash.startsWith("#avis-") ? hash.slice("#avis-".length) : null,
      );
    }

    const timeout = window.setTimeout(syncHighlightedReview, 0);
    syncHighlightedReview();
    window.addEventListener("hashchange", syncHighlightedReview);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("hashchange", syncHighlightedReview);
    };
  }, []);

  const currentCount = useMemo(
    () => reviews.filter((review) => review.isCurrent).length,
    [reviews],
  );
  const formerCount = reviews.length - currentCount;
  const recommendedCount = useMemo(
    () => reviews.filter((review) => review.recommend === true).length,
    [reviews],
  );
  const notRecommendedCount = useMemo(
    () => reviews.filter((review) => review.recommend === false).length,
    [reviews],
  );

  const filtered = useMemo(() => {
    let list = reviews;

    if (status === "current") {
      list = list.filter((review) => review.isCurrent);
    } else if (status === "former") {
      list = list.filter((review) => !review.isCurrent);
    }

    if (recommend === "yes") {
      list = list.filter((review) => review.recommend === true);
    } else if (recommend === "no") {
      list = list.filter((review) => review.recommend === false);
    }

    if (sort === "best") {
      list = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    } else if (sort === "worst") {
      list = [...list].sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    } else {
      list = [...list].sort(
        (a, b) =>
          (b.publishedAt ? Date.parse(b.publishedAt) : 0) -
          (a.publishedAt ? Date.parse(a.publishedAt) : 0),
      );
    }

    return list;
  }, [reviews, sort, status, recommend]);

  const returnTo = `/entreprises/${slug}?statut=${status}&sort=${sort}&recommandation=${recommend}`;

  return (
    <section aria-labelledby="avis-employes">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Retours d&apos;expérience
          </p>
          <h2
            id="avis-employes"
            className="mt-1 text-3xl font-extrabold uppercase tracking-tight text-ink"
          >
            Avis des employés
          </h2>
          <p className="mt-1 text-sm text-muted">
            {filtered.length} avis affiché
            {filtered.length !== 1 ? "s" : ""} sur {reviews.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="sort"
            className="font-mono text-xs uppercase tracking-wide text-muted"
          >
            Trier par
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => {
              const value = event.target.value;
              if (isSortValue(value)) setSort(value);
            }}
            className="border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink"
          >
            <option value="recent">Plus récents</option>
            <option value="best">Meilleures notes</option>
            <option value="worst">Moins bonnes notes</option>
          </select>
        </div>
      </div>

      <nav
        aria-label="Filtrer les avis"
        className="mt-4 flex flex-wrap gap-5 border-b border-line"
      >
        {[
          {
            value: "all" as const,
            label: "Tous les avis",
            count: reviews.length,
          },
          { value: "current" as const, label: "Actuels", count: currentCount },
          { value: "former" as const, label: "Anciens", count: formerCount },
        ].map((tab) => {
          const active = status === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition ${
                active
                  ? "border-ink text-ink"
                  : "border-transparent text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {tab.label}{" "}
              <span className="font-mono text-xs font-normal text-muted">
                ({tab.count})
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-mono text-xs uppercase tracking-wide text-muted">
          Recommandation
        </span>
        {[
          { value: "all" as const, label: "Tous", count: reviews.length },
          {
            value: "yes" as const,
            label: "Recommande",
            count: recommendedCount,
          },
          {
            value: "no" as const,
            label: "Déconseille",
            count: notRecommendedCount,
          },
        ].map((filter) => {
          const active = recommend === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setRecommend(filter.value)}
              aria-pressed={active}
              className={`border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-soft hover:border-ink hover:text-ink"
              }`}
            >
              {filter.label}{" "}
              <span
                className={`font-mono text-[11px] font-normal ${
                  active ? "text-paper/70" : "text-muted"
                }`}
              >
                ({filter.count})
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="text-muted">
            {reviews.length === 0
              ? hideReviewCta
                ? "Aucun avis publié pour cette entreprise."
                : "Aucun avis publié pour cette entreprise. Soyez le premier à partager votre expérience."
              : "Aucun avis ne correspond à ces filtres."}
          </p>
          {reviews.length === 0 ? (
            hideReviewCta ? null : (
              <Link
                href="/deposer-avis"
                className="mt-5 inline-block bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
              >
                Déposer un avis
              </Link>
            )
          ) : (
            <button
              type="button"
              onClick={() => {
                setStatus("all");
                setSort("recent");
                setRecommend("all");
              }}
              className="mt-3 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {filtered.map((review) => {
            const reviewStars =
              review.score === null ? null : scoreToFloatStars(review.score);
            const responses = [
              ...review.responses,
              ...(extraResponses[review.id] ?? []),
            ];
            const authorName = review.authorName;
            const initials =
              authorName === "Anonyme"
                ? "A"
                : authorName
                    .split(/\s+/)
                    .map((part) => part[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
            const publishedLabel = review.publishedAt
              ? new Date(review.publishedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : null;
            const showJobTitle = !(
              review.visibility === "ANONYMOUS" && review.isCurrent
            );
            const period = formatPeriod(review.startDate, review.endDate);

            return (
              <article
                key={review.id}
                id={`avis-${review.id}`}
                className={`scroll-mt-24 border bg-surface p-6 ${
                  highlightedId === review.id
                    ? "border-2 border-accent"
                    : "border-line"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-sm font-bold text-paper">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-ink">{authorName}</span>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {review.verified ? (
                          <span className="bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent">
                            Vérifié
                          </span>
                        ) : (
                          <span className="bg-gold/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-gold">
                            Non vérifié
                          </span>
                        )}
                        {review.recommend !== null ? (
                          <span
                            className={`px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${
                              review.recommend
                                ? "bg-accent/10 text-accent"
                                : "bg-danger/10 text-danger"
                            }`}
                          >
                            {review.recommend ? "Recommande" : "Déconseille"}
                          </span>
                        ) : null}
                      </div>
                      {showJobTitle ? (
                        <p className="mt-1 text-sm text-soft">
                          {review.jobTitle}
                          {review.location ? ` · ${review.location}` : ""}
                        </p>
                      ) : review.location ? (
                        <p className="mt-1 text-sm text-soft">
                          {review.location}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    {reviewStars !== null ? (
                      <Stars value={reviewStars} size="text-base" />
                    ) : null}
                    {publishedLabel ? (
                      <span className="font-mono text-xs text-muted">
                        {publishedLabel}
                      </span>
                    ) : null}
                  </div>
                </div>

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
                </div>

                {responses.length > 0 ? (
                  <div className="mt-5 space-y-4 border-l-2 border-accent bg-paper p-4">
                    {responses.map((resp) => (
                      <div key={resp.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 font-bold text-ink">
                            Réponse de l&apos;entreprise
                            {companyVerified ? (
                              <CompanyVerifiedBadge className="h-4 w-4" />
                            ) : null}
                          </span>
                          <span className="font-mono text-xs text-muted">
                            {new Date(resp.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-soft">
                          {resp.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {canRespondAsCompany ? (
                  <CompanyResponseForm
                    reviewId={review.id}
                    onPosted={(response) =>
                      setExtraResponses((current) => ({
                        ...current,
                        [review.id]: [
                          ...(current[review.id] ?? []),
                          response,
                        ],
                      }))
                    }
                  />
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 font-mono text-xs text-muted">
                  <span>
                    {review.isCurrent ? "Employé actuel" : "Ancien employé"}
                  </span>
                  {period ? <span>· {period}</span> : null}
                  {review.contractType ? (
                    <span>· {review.contractType}</span>
                  ) : null}
                </div>

                <ReviewSocial
                  reviewId={review.id}
                  initialLiked={
                    currentUserId !== null &&
                    review.likes.some((like) => like.userId === currentUserId)
                  }
                  initialLikeCount={review.likes.length}
                  initialReplies={review.replies}
                  isAuthenticated={isAuthenticated}
                  canReport={review.canReport}
                  returnTo={returnTo}
                  hideReply={canRespondAsCompany}
                />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
