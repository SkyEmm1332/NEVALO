import Link from "next/link";

export function CompanyReviewNotification({
  companyName,
  href,
  count,
}: {
  companyName: string;
  href: string;
  count: number;
}) {
  const label =
    count === 0
      ? "Aucun avis reçu"
      : count === 1
        ? "1 avis reçu"
        : `${count} avis reçus`;

  return (
    <Link
      href={href}
      title={`${label} sur ${companyName}`}
      aria-label={`${label} sur ${companyName}`}
      className="flex h-10 items-center gap-2 px-2 text-sm font-semibold text-paper transition hover:text-white"
    >
      <BellIcon />
      <span className="hidden sm:inline">Avis reçus</span>
      <span
        className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-bold ${
          count > 0 ? "bg-amber text-ink" : "bg-white/20 text-paper"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

export function BellIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M5.5 8.25a4.5 4.5 0 0 1 9 0c0 2.1.6 3.2 1.25 4H4.25c.65-.8 1.25-1.9 1.25-4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 15a1.75 1.75 0 0 0 3.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
