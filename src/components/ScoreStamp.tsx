import { Stars } from "@/components/Stars";

export function ScoreStamp({
  score,
  size = "md",
}: {
  score: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: "h-28 w-28",
    md: "h-36 w-36",
    lg: "h-48 w-48",
  }[size];
  const scoreSize = { sm: "text-4xl", md: "text-5xl", lg: "text-6xl" }[size];
  const unitSize = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];
  const labelSize = { sm: "text-[10px]", md: "text-xs", lg: "text-sm" }[size];
  const starSize = { sm: "text-base", md: "text-xl", lg: "text-2xl" }[size];

  if (score === null) {
    return (
      <div
        className={`${dims} flex flex-col items-center justify-center rounded-full border-4 border-dashed border-teal/40 bg-paper text-muted shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-4 ring-teal/15`}
      >
        <span className={`font-mono uppercase tracking-widest ${labelSize}`}>
          Non
        </span>
        <span className={`font-mono uppercase tracking-widest ${labelSize}`}>
          évaluée
        </span>
      </div>
    );
  }

  return (
    <div className="relative inline-flex">
      <div
        className={`${dims} flex flex-col items-center justify-center rounded-full border-4 border-dashed border-teal bg-paper text-ink shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-4 ring-teal/30`}
      >
        <span
          className={`whitespace-nowrap font-mono uppercase tracking-[0.2em] text-muted ${labelSize}`}
        >
          Nevalo
        </span>
        <span className="mt-2 flex flex-nowrap items-baseline justify-center gap-1 whitespace-nowrap">
          <span
            className={`font-mono font-bold leading-none tracking-tight tabular ${scoreSize}`}
          >
            {score}
          </span>
          <span
            className={`font-mono font-medium uppercase tracking-widest text-muted ${unitSize}`}
          >
            /100
          </span>
        </span>
        <span className="mt-2 flex justify-center whitespace-nowrap">
          <Stars value={score / 20} size={starSize} color="text-teal" />
        </span>
      </div>
    </div>
  );
}
