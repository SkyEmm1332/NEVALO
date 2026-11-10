import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  stats,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  stats?: { value: string; label: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-ink text-paper">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(48% 60% at 88% 0%, rgba(20,184,166,0.12), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:items-end">
          <div>
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-teal">
              <span className="h-px w-8 bg-teal/70" aria-hidden="true" />
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.04] tracking-tight text-paper sm:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/70 sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>

          {stats && stats.length > 0 ? (
            <div className="grid grid-cols-3 gap-5 border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {stats.map((s) => (
                <div key={s.label} className="lg:text-right">
                  <div className="font-mono text-2xl font-bold tabular text-paper sm:text-3xl">
                    {s.value}
                  </div>
                  <div className="mt-1.5 text-[11px] uppercase leading-tight tracking-[0.08em] text-paper/50">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {children}
      </div>
    </section>
  );
}
