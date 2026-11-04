"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Reply = {
  id: string;
  content: string;
  createdAt: string;
  authorName: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function ThumbIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Z" />
      <path d="M7 10l4.2-6.3A1.8 1.8 0 0 1 14.2 5v4h4.1a2 2 0 0 1 1.9 2.5l-1.6 7A2 2 0 0 1 16.7 20H7" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

export function ReviewSocial({
  reviewId,
  initialLiked,
  initialLikeCount,
  initialReplies,
  isAuthenticated,
  returnTo,
}: {
  reviewId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialReplies: Reply[];
  isAuthenticated: boolean;
  returnTo: string;
}) {
  const router = useRouter();
  const loginHref = `/login?callbackUrl=${encodeURIComponent(returnTo)}`;
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [replies, setReplies] = useState(initialReplies);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  async function toggleLike() {
    if (!isAuthenticated) {
      router.push(loginHref);
      return;
    }
    if (likeLoading) return;

    const previousLiked = liked;
    const previousCount = likeCount;

    setLiked(!previousLiked);
    setLikeCount(previousCount + (previousLiked ? -1 : 1));
    setLikeLoading(true);
    setLikeError(null);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: "POST",
      });

      if (response.status === 401) {
        setLiked(previousLiked);
        setLikeCount(previousCount);
        router.push(loginHref);
        return;
      }

      if (!response.ok) throw new Error();

      const data = (await response.json()) as {
        liked: boolean;
        count: number;
      };
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch {
      setLiked(previousLiked);
      setLikeCount(previousCount);
      setLikeError("Impossible d'enregistrer votre vote.");
    } finally {
      setLikeLoading(false);
    }
  }

  async function submitReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      router.push(loginHref);
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      setReplyError("Écrivez une réponse avant de l'envoyer.");
      return;
    }

    setReplyLoading(true);
    setReplyError(null);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (response.status === 401) {
        router.push(loginHref);
        return;
      }

      const data = (await response.json().catch(() => ({}))) as
        | Reply
        | { error?: string };

      if (!response.ok) {
        setReplyError(
          "error" in data && data.error
            ? data.error
            : "Impossible de publier votre réponse.",
        );
        return;
      }

      setReplies((current) => [...current, data as Reply]);
      setContent("");
      setOpen(false);
    } catch {
      setReplyError("Impossible de publier votre réponse.");
    } finally {
      setReplyLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          disabled={likeLoading}
          title={
            isAuthenticated
              ? "Marquer cet avis comme utile"
              : "Connectez-vous pour voter"
          }
          className={`inline-flex items-center gap-2 border px-3 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
            liked
              ? "border-accent bg-accent/10 text-accent"
              : "border-line text-soft hover:border-ink hover:text-ink"
          }`}
        >
          <ThumbIcon />
          Utile
          <span className="font-mono text-xs">{likeCount}</span>
        </button>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => {
              setOpen((value) => !value);
              setReplyError(null);
            }}
            aria-expanded={open}
            className="inline-flex items-center gap-2 border border-line px-3 py-2 text-sm font-semibold text-soft transition hover:border-ink hover:text-ink"
          >
            <ReplyIcon />
            Répondre
            {replies.length > 0 ? (
              <span className="font-mono text-xs">({replies.length})</span>
            ) : null}
          </button>
        ) : (
          <Link
            href={loginHref}
            className="inline-flex items-center gap-2 border border-line px-3 py-2 text-sm font-semibold text-soft transition hover:border-ink hover:text-ink"
          >
            <ReplyIcon />
            Répondre
          </Link>
        )}
      </div>

      {likeError ? (
        <p className="mt-2 text-xs text-danger">{likeError}</p>
      ) : null}

      {open && isAuthenticated ? (
        <form
          onSubmit={submitReply}
          className="mt-3 border border-line bg-paper p-4"
        >
          <label
            htmlFor={`reply-${reviewId}`}
            className="font-mono text-xs uppercase tracking-[0.16em] text-muted"
          >
            Votre réponse
          </label>
          <textarea
            id={`reply-${reviewId}`}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setReplyError(null);
            }}
            rows={3}
            maxLength={2000}
            placeholder="Partagez votre point de vue..."
            className="mt-2 w-full resize-y border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-ink"
          />
          {replyError ? (
            <p className="mt-2 text-xs text-danger">{replyError}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs text-muted">
              {content.length}/2000
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setReplyError(null);
                }}
                className="border border-line px-3 py-2 text-sm font-semibold text-soft transition hover:border-ink hover:text-ink"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={replyLoading || !content.trim()}
                className="bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                {replyLoading ? "Publication..." : "Publier"}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {replies.length > 0 ? (
        <div className="mt-4 space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            Réponses ({replies.length})
          </p>
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="border-l-2 border-line-strong bg-paper px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">
                  {reply.authorName ?? "Membre NEVALO"}
                </span>
                <span className="font-mono text-xs text-muted">
                  {formatDate(reply.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-soft">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
