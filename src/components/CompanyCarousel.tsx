"use client";

import { useCallback, useEffect, useState } from "react";
import { CompanyCard } from "@/components/CompanyCard";
import type { CompanySummary } from "@/components/CompanyCard";

const AUTOPLAY_MS = 6500;

function usePerView() {
  const [perView, setPerView] = useState(5);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPerView(w >= 1024 ? 5 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perView;
}

export function CompanyCarousel({ companies }: { companies: CompanySummary[] }) {
  const count = companies.length;
  const perView = usePerView();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const maxIndex = Math.max(0, count - perView);
  const safeIndex = Math.min(index, maxIndex);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = useCallback(
    (dir: number) =>
      setIndex((i) => Math.min(maxIndex, Math.max(0, i + dir))),
    [maxIndex],
  );

  useEffect(() => {
    if (paused || reduceMotion || count < 2 || safeIndex >= maxIndex) return;
    const timer = window.setTimeout(
      () => setIndex((i) => Math.min(i + 1, maxIndex)),
      AUTOPLAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [paused, reduceMotion, count, safeIndex, maxIndex]);

  if (count === 0) return null;

  const atStart = safeIndex === 0;
  const atEnd = safeIndex >= maxIndex;

  return (
    <div
      className="relative"
      aria-roledescription="carrousel"
      aria-label="Entreprises du registre"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3 pb-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Entreprises {safeIndex + 1}–{Math.min(safeIndex + perView, count)} sur{" "}
          {count}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={atStart}
            aria-label="Entreprises précédentes"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-35"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={atEnd}
            aria-label="Entreprises suivantes"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-35"
          >
            →
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${safeIndex * (100 / perView)}%)` }}
        >
          {companies.map((c, i) => {
            const visible = i >= safeIndex && i < safeIndex + perView;
            return (
              <div
                key={c.id}
                role="group"
                aria-roledescription="slide"
                aria-hidden={!visible}
                inert={!visible}
                className="shrink-0 p-1.5"
                style={{ width: `${100 / perView}%` }}
              >
                <CompanyCard company={c} />
              </div>
            );
          })}
        </div>
      </div>

      {maxIndex > 0 ? (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Afficher les entreprises à partir de la ${i + 1}`}
              aria-current={i === safeIndex}
              className={`h-1.5 rounded-full transition-all ${
                i === safeIndex
                  ? "w-6 bg-accent"
                  : "w-1.5 bg-ink/20 hover:bg-ink/40"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
