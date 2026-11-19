type MonEspaceBannerProps = {
  name: string | null | undefined;
  email: string | null | undefined;
  reviewCount: number;
  helpfulCount: number;
};

export function MonEspaceBanner({
  name,
  email,
  reviewCount,
  helpfulCount,
}: MonEspaceBannerProps) {
  const firstName = name?.trim().split(/\s+/)[0] || "Mon espace";

  return (
    <section className="relative overflow-hidden border-b border-line bg-ink text-paper">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(48% 80% at 88% 0%, rgba(20,184,166,0.12), transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:py-7">
        <div>
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-teal">
            <span className="h-px w-8 bg-teal/70" aria-hidden="true" />
            Registre · Espace personnel
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-paper sm:text-4xl">
            {firstName}
          </h1>
          <p className="mt-1 font-mono text-sm text-paper/55">{email}</p>
        </div>

        <div className="flex items-center gap-7">
          <div className="flex flex-col items-center text-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-teal"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
            <span className="mt-1.5 font-mono text-2xl font-bold tabular text-paper">
              {reviewCount}
            </span>
            <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/50">
              {reviewCount === 1 ? "avis écrit" : "avis écrits"}
            </span>
          </div>
          <div className="flex flex-col items-center text-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-teal"
              aria-hidden="true"
            >
              <path d="M7 10v12" />
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
            </svg>
            <span className="mt-1.5 font-mono text-2xl font-bold tabular text-teal">
              {helpfulCount}
            </span>
            <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/50">
              {helpfulCount === 1 ? "avis utile reçu" : "avis utiles reçus"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
