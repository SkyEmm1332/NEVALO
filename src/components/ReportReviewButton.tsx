"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  REPORT_DETAILS_MAX_LENGTH,
  REPORT_OTHER_REASON,
  REPORT_REASONS,
  type ReportReason,
} from "@/lib/reports";

function FlagIcon({
  className = "",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? "1.4" : "1.7"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 ${filled ? "scale-110" : ""} ${className}`}
      aria-hidden="true"
    >
      <path d="M5 21V4" />
      <path d="M5 5h11l-1.5 3L16 11H5" />
    </svg>
  );
}

export function ReportReviewButton({
  reviewId,
  isAuthenticated,
  returnTo,
}: {
  reviewId: string;
  isAuthenticated: boolean;
  returnTo: string;
}) {
  const router = useRouter();
  const loginHref = `/login?callbackUrl=${encodeURIComponent(returnTo)}`;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      router.push(loginHref);
      return;
    }

    if (!reason) {
      setError("Choisissez un motif de signalement.");
      return;
    }

    if (reason === REPORT_OTHER_REASON && !details.trim()) {
      setError("Précisez le motif de votre signalement.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      });

      if (response.status === 401) {
        router.push(loginHref);
        return;
      }

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(
          data.error ?? "Impossible d'enregistrer votre signalement.",
        );
        return;
      }

      setSent(true);
      setOpen(false);
      setReason("");
      setDetails("");
    } catch {
      setError("Impossible d'enregistrer votre signalement.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p
        role="status"
        className="mt-2 inline-flex items-center gap-2 px-2 py-2 text-sm font-semibold text-ink"
      >
        <FlagIcon filled className="text-danger" />
        Signalement transmis
      </p>
    );
  }

  return (
    <div className="contents">
      {isAuthenticated ? (
        <button
          type="button"
          onClick={() => {
            setOpen((value) => !value);
            setError(null);
          }}
          aria-label="Signaler"
          aria-expanded={open}
          title="Signaler cet avis"
          className={`inline-flex h-9 w-9 items-center justify-center transition ${
            open ? "text-danger" : "text-soft hover:text-danger"
          }`}
        >
          <FlagIcon filled={open} />
        </button>
      ) : (
        <Link
          href={loginHref}
          aria-label="Signaler"
          title="Connectez-vous pour signaler cet avis"
          className="inline-flex h-9 w-9 items-center justify-center text-soft transition hover:text-danger"
        >
          <FlagIcon />
        </Link>
      )}

      {open && isAuthenticated ? (
        <form
          onSubmit={submitReport}
          className="mt-3 w-full border border-danger/25 bg-danger/5 p-4"
        >
          <p className="font-semibold text-ink">Signaler cet avis</p>
          <p className="mt-1 text-xs leading-relaxed text-soft">
            Un signalement ne supprime pas l’avis. Notre équipe l’examine et
            peut le retirer s’il enfreint les règles.
          </p>

          <label
            htmlFor={`report-reason-${reviewId}`}
            className="mt-3 block font-mono text-xs uppercase tracking-[0.16em] text-muted"
          >
            Motif
          </label>
          <select
            id={`report-reason-${reviewId}`}
            required
            value={reason}
            onChange={(event) => {
              setReason(event.target.value as ReportReason | "");
              setError(null);
            }}
            className="mt-2 w-full border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-ink"
          >
            <option value="">Choisir un motif</option>
            {REPORT_REASONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label
            htmlFor={`report-details-${reviewId}`}
            className="mt-3 block font-mono text-xs uppercase tracking-[0.16em] text-muted"
          >
            Précisions {reason === REPORT_OTHER_REASON ? "*" : "(facultatif)"}
          </label>
          <textarea
            id={`report-details-${reviewId}`}
            value={details}
            onChange={(event) => {
              setDetails(event.target.value);
              setError(null);
            }}
            rows={3}
            maxLength={REPORT_DETAILS_MAX_LENGTH}
            required={reason === REPORT_OTHER_REASON}
            placeholder="Expliquez ce qui pose problème..."
            className="mt-2 w-full resize-y border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-ink"
          />

          {error ? (
            <p role="alert" className="mt-2 text-xs text-danger">
              {error}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs text-muted">
              {details.length}/{REPORT_DETAILS_MAX_LENGTH}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                className="border border-line bg-surface px-3 py-2 text-sm font-semibold text-soft transition hover:border-ink hover:text-ink"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  !reason ||
                  (reason === REPORT_OTHER_REASON && !details.trim())
                }
                className="bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Envoyer le signalement"}
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
