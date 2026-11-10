"use client";

import { useEffect, useMemo, useState } from "react";

export type TypingReviewItem = {
  text: string;
  company: string;
  jobTitle?: string | null;
};

const TYPE_MS = 26;
const HOLD_MS = 3200;

type Phase = "typing" | "holding";

export function TypingReview({ reviews }: { reviews: TypingReviewItem[] }) {
  const items = useMemo(
    () =>
      reviews
        .filter((review) => review.text.trim().length > 0)
        .slice(0, 6)
        .map((review) => ({
          ...review,
          text:
            review.text.length > 140
              ? `${review.text.slice(0, 137).trimEnd()}…`
              : review.text,
        })),
    [reviews],
  );

  const [index, setIndex] = useState(0);
  const [charCount, setCharCount] = useState(
    () => items[0]?.text.length ?? 0,
  );
  const [phase, setPhase] = useState<Phase>("holding");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion || items.length === 0) return;

    const current = items[index % items.length];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (charCount < current.text.length) {
        const char = current.text[charCount];
        timer = setTimeout(
          () => setCharCount((count) => count + 1),
          char === " " ? TYPE_MS + 24 : TYPE_MS,
        );
      } else {
        timer = setTimeout(() => setPhase("holding"), 250);
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => {
        setIndex((value) => (value + 1) % items.length);
        setCharCount(0);
        setPhase("typing");
      }, HOLD_MS);
    }

    return () => clearTimeout(timer);
  }, [charCount, index, items, phase, reduceMotion]);

  if (items.length === 0) return null;

  const current = items[index % items.length];
  const text = reduceMotion ? current.text : current.text.slice(0, charCount);

  return (
    <div
      className="mt-5 max-w-lg border-l-2 border-teal/60 pl-4"
      role="group"
      aria-label="Avis d'employés en rotation"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal">
        Avis
      </p>
      <div className="mt-1.5 min-h-[3rem]">
        <p className="text-sm leading-relaxed text-paper/80">
          <span aria-hidden="true">« </span>
          <span aria-hidden="true">{text}</span>
          {!reduceMotion && phase === "typing" ? (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.2em] bg-teal align-baseline"
            />
          ) : null}
          <span aria-hidden="true"> »</span>
        </p>
      </div>
      <p className="sr-only">
        Avis d&apos;employés en rotation :{" "}
        {items.map((item) => item.text).join(" ")}
      </p>
    </div>
  );
}
