import { TONE_BADGE, TONE_DOT, type AdminTone } from "@/lib/admin-ui";

export function AdminStatusBadge({
  label,
  tone = "muted",
  className = "",
}: {
  label: string;
  tone?: AdminTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${TONE_BADGE[tone]} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[tone]}`}
      />
      {label}
    </span>
  );
}
