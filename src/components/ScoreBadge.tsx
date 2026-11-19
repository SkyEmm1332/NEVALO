import { Stars } from "@/components/Stars";

export function ScoreBadge({
  score,
  className = "",
}: {
  score: number | null;
  className?: string;
}) {
  if (score === null) {
    return (
      <span className={`font-mono text-xs text-muted ${className}`}>
        Non évalué
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="whitespace-nowrap font-mono text-sm font-bold tabular text-accent">
        {score}
        <span className="text-[10px] font-normal text-muted">/100</span>
      </span>
      <Stars value={score / 20} size="text-[10px]" color="text-teal" />
    </span>
  );
}
