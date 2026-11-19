import type { ReactNode } from "react";
import { TONE_DOT, type AdminTone } from "@/lib/admin-ui";

export function AdminSummary({
  items,
  className = "",
}: {
  items: {
    label: string;
    value: ReactNode;
    detail?: string;
    tone: AdminTone;
  }[];
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-3 lg:grid-cols-4 ${className}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="relative overflow-hidden rounded-lg border border-line bg-surface p-4"
        >
          <span
            aria-hidden="true"
            className={`absolute inset-x-0 top-0 h-1 ${TONE_DOT[item.tone]}`}
          />
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT[item.tone]}`}
            />
            <p className="text-xs font-medium text-muted">{item.label}</p>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold tabular text-ink">
            {item.value}
          </p>
          {item.detail ? (
            <p className="mt-0.5 text-xs text-muted">{item.detail}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
