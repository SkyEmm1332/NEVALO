import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCompanyThread } from "../actions";

export default async function NewCompanyMessagePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/mon-espace/entreprise/messages/nouveau");
  }

  if (session.user.role !== "REPRESENTATIVE") {
    redirect("/mon-espace");
  }

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  });

  if (!account?.companyId) {
    redirect("/mon-espace/entreprise");
  }

  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-12">
      <nav
        aria-label="Fil d'Ariane"
        className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted"
      >
        <Link
          href="/mon-espace/entreprise"
          className="transition hover:text-ink"
        >
          Tableau de bord
        </Link>
        <span className="text-muted/40">/</span>
        <Link
          href="/mon-espace/entreprise/messages"
          className="transition hover:text-ink"
        >
          Messages
        </Link>
        <span className="text-muted/40">/</span>
        <span className="text-ink">Nouvelle requête</span>
      </nav>

      <header className="mt-6 border-b border-line pb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Nouvelle requête
        </h1>
        <p className="mt-1 text-sm text-soft">
          Décrivez votre demande à l&apos;équipe NEVALO.
        </p>
      </header>

      {params.error ? (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          L&apos;objet et le message sont requis (2 000 caractères max).
        </p>
      ) : null}

      <form
        action={createCompanyThread}
        className="mt-8 rounded-xl border border-line bg-surface p-6"
      >
        <label
          htmlFor="company-subject"
          className="font-mono text-xs uppercase tracking-[0.16em] text-muted"
        >
          Objet *
        </label>
        <input
          id="company-subject"
          name="subject"
          maxLength={120}
          placeholder="Ex : Demande de vérification"
          required
          className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent"
        />

        <label
          htmlFor="company-message"
          className="mt-4 block font-mono text-xs uppercase tracking-[0.16em] text-muted"
        >
          Message *
        </label>
        <textarea
          id="company-message"
          name="content"
          rows={5}
          maxLength={2000}
          placeholder="Décrivez votre requête..."
          required
          className="mt-2 w-full resize-y rounded-lg border border-line bg-paper px-3 py-2 text-sm leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-accent"
        />

        <div className="mt-5 flex items-center justify-end gap-3">
          <Link
            href="/mon-espace/entreprise/messages"
            className="rounded-lg border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}
