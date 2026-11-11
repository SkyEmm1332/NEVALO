import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updatePassword, updateProfile } from "./actions";

export const metadata = {
  title: "Paramètres · NEVALO",
};

const inputClass =
  "mt-1.5 w-full border border-line bg-paper px-4 py-2.5 text-ink outline-none transition placeholder:text-muted focus:border-ink";

const MESSAGES: Record<string, string> = {
  profile: "Votre nom a été mis à jour.",
  password: "Votre mot de passe a été mis à jour.",
  name: "Le nom doit contenir au moins 2 caractères.",
  confirm: "Les nouveaux mots de passe ne correspondent pas.",
  current: "Le mot de passe actuel est incorrect.",
};

export default async function ParametresPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/mon-espace/parametres");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, createdAt: true },
  });

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const notice = params.updated ? MESSAGES[params.updated] : null;
  const error = params.error ? MESSAGES[params.error] : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-14">
      <div className="border-b-2 border-ink pb-4">
        <Link
          href="/mon-espace"
          className="font-mono text-xs uppercase tracking-[0.2em] text-accent transition hover:text-accent-deep"
        >
          ← Mes avis
        </Link>
        <h1 className="mt-3 text-4xl font-extrabold uppercase tracking-tight text-ink">
          Paramètres
        </h1>
        <p className="mt-1 font-mono text-sm text-muted">{user.email}</p>
      </div>

      {notice ? (
        <p className="mt-6 border border-accent bg-accent/5 px-4 py-3 text-sm text-accent">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <section className="mt-8 border border-line bg-surface p-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Profil
        </h2>
        <form action={updateProfile} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="name">
              Nom affiché
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              defaultValue={user.name ?? ""}
              autoComplete="name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              readOnly
              className={`${inputClass} cursor-not-allowed bg-line/30`}
            />
          </div>
          <p className="text-xs text-muted">
            Le nom affiché dans la navigation sera mis à jour à votre prochaine
            connexion.
          </p>
          <button
            type="submit"
            className="border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
          >
            Enregistrer le profil
          </button>
        </form>
      </section>

      <section className="mt-6 border border-line bg-surface p-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Mot de passe
        </h2>
        <form action={updatePassword} className="mt-4 space-y-4">
          <div>
            <label
              className="block text-sm font-semibold text-ink"
              htmlFor="currentPassword"
            >
              Mot de passe actuel
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold text-ink"
              htmlFor="newPassword"
            >
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold text-ink"
              htmlFor="confirmPassword"
            >
              Confirmer le nouveau mot de passe
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
          >
            Changer le mot de passe
          </button>
        </form>
      </section>
    </div>
  );
}
