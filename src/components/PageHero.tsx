import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  stats,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  stats?: { value: string; label: string }[];
  children?: ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden text-paper"
      style={{
        background:
          "linear-gradient(140deg, #0f766e 0%, #115e59 48%, #0a3a35 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 60% at 85% 10%, rgba(20,184,166,0.4), transparent 70%), radial-gradient(35% 45% at 5% 95%, rgba(232,146,12,0.25), transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute -right-12 top-6 h-44 w-44 rounded-full bg-teal/25 blur-3xl animate-drift" />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-14 sm:py-16">
        <div className="grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="animate-fade-up font-mono text-xs uppercase tracking-[0.25em] text-teal">
              {eyebrow}
            </p>
            <h1
              className="animate-fade-up mt-3 text-4xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-5xl"
              style={{ animationDelay: "80ms" }}
            >
              {title}
            </h1>
            {description ? (
              <p
                className="animate-fade-up mt-4 max-w-2xl text-lg leading-relaxed text-paper/85"
                style={{ animationDelay: "160ms" }}
              >
                {description}
              </p>
            ) : null}
          </div>

          {stats && stats.length > 0 ? (
            <div
              className="animate-fade-up grid grid-cols-3 gap-4 border-t border-paper/20 pt-5 lg:border-t-0 lg:pt-0"
              style={{ animationDelay: "200ms" }}
            >
              {stats.map((s) => (
                <div key={s.label} className="lg:text-right">
                  <div className="font-mono text-3xl font-bold tabular text-white">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase leading-tight tracking-wide text-paper/70">
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
