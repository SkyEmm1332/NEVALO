import type { ReactNode } from "react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import type { AdminTone } from "@/lib/admin-ui";

export function AdminPageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: string;
  description: string;
  badge?: { label: string; tone: AdminTone };
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {badge ? <AdminStatusBadge label={badge.label} tone={badge.tone} /> : null}
        </div>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
