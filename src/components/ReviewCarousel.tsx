"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { Stars } from "@/components/Stars";
import { scoreToFloatStars } from "@/lib/rating";

const AUTOPLAY_MS = 6500;

export type CarouselReview = {
  id: string;
  companyName: string;
  companySlug: string | null;
  jobTitle: string | null;
  positives: string | null;
  score: number | null;
  date: string;
  isCurrent: boolean;
};

function usePerView() {
  const [perView, setPerView] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPerView(w >= 1024 ? 4 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perView;
}

export function ReviewCarousel({ reviews }: { reviews: CarouselReview[] }) {
  const count = reviews.length;
  const perView = usePerView();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion || count < 2) return;
    const timer = window.setTimeout(() => setIndex((i) => i + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [paused, reduceMotion, count, index]);

  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  if (count === 0) return null;

  const go = (dir: number) =>
    setIndex((i) => Math.min(count, Math.max(-1, i + dir)));

  const slides = [
    ...reviews.slice(-perView),
    ...reviews,
    ...reviews.slice(0, perView),
  ];
  const position = perView + index;

  return (
    <div
      className="flex items-center gap-2 sm:gap-4"
      aria-roledescription="carrousel"
      aria-label="Derniers avis"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Avis précédents"
        className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-card transition hover:bg-paper sm:h-11 sm:w-11"
      >
        ←
      </button>

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div
          className={`flex ${animate ? "transition-transform duration-500 ease-out" : ""}`}
          style={{ transform: `translateX(-${position * (100 / perView)}%)` }}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            if (index < 0) {
              setAnimate(false);
              setIndex(count - 1);
            } else if (index >= count) {
              setAnimate(false);
              setIndex(0);
            }
          }}
        >
          {slides.map((r, i) => (
            <div
              key={`${r.id}-${i}`}
              role="group"
              aria-roledescription="slide"
              className="shrink-0 p-2"
              style={{ width: `${100 / perView}%` }}
            >
              <article className="flex h-full flex-col rounded-xl border border-line bg-surface p-5">
                <div className="flex items-center gap-3">
                  <CompanyAvatar
                    name={r.companyName}
                    size="h-11 w-11 text-xs"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/entreprises/${r.companySlug ?? ""}`}
                      className="block text-base font-bold leading-tight text-ink transition hover:text-accent line-clamp-2"
                    >
                      {r.companyName}
                    </Link>
                    <p className="truncate font-mono text-[11px] uppercase tracking-wide text-muted">
                      {r.jobTitle ?? "Salarié"}
                    </p>
                  </div>
                </div>

                {r.score !== null ? (
                  <div className="mt-3 flex items-center gap-2">
                    <Stars
                      value={scoreToFloatStars(r.score)}
                      size="text-xs"
                    />
                    <span className="font-mono text-sm font-bold tabular text-ink">
                      {r.score}
                      <span className="font-normal text-muted">/100</span>
                    </span>
                  </div>
                ) : null}

                <p className="mt-4 flex-1 text-base leading-relaxed text-ink line-clamp-5">
                  &laquo;&nbsp;
                  {r.positives ??
                    "Un avis a été déposé sur cette entreprise."}
                  &nbsp;&raquo;
                </p>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
                  <span className="font-mono text-[11px] text-muted">
                    {r.date}
                  </span>
                  <Link
                    href={`/entreprises/${r.companySlug ?? ""}`}
                    className="text-xs font-semibold text-accent transition hover:text-accent-deep"
                  >
                    Lire →
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Avis suivants"
        className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-card transition hover:bg-paper sm:h-11 sm:w-11"
      >
        →
      </button>
    </div>
  );
}
