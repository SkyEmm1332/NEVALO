import Link from "next/link";

export function MessagesIcon({ unread }: { unread: number }) {
  return (
    <Link
      href="/mon-espace/entreprise/messages"
      aria-label="Messages"
      className="relative flex h-16 w-16 items-center justify-center text-paper transition hover:bg-white/10 hover:text-white"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="h-6 w-6"
      >
        <rect
          x="2.5"
          y="4"
          width="15"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="m3.5 6 6.5 5 6.5-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {unread > 0 ? (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 font-mono text-[10px] font-bold text-ink">
          {unread}
        </span>
      ) : null}
    </Link>
  );
}
