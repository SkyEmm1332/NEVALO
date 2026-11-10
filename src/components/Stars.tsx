export function Stars({
  value,
  size = "text-base",
  color = "text-gold",
}: {
  value: number;
  size?: string;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className={`relative inline-block whitespace-nowrap leading-none ${size}`} aria-label={`${value.toFixed(1).replace(".", ",")} sur 5`}>
      <span className="text-ink/25">★★★★★</span>
      <span
        className={`absolute inset-0 overflow-hidden whitespace-nowrap ${color}`}
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}
