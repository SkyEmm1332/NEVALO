import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ScrollSpyNav } from "@/components/ScrollSpyNav";
import {
  deleteAccount,
  updateNotifications,
  updatePassword,
  updatePrivacy,
  updateProfile,
} from "./actions";

export const metadata = {
  title: "Paramètres — NEVALO",
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20";

const labelClass = "block text-sm font-semibold text-ink";

const cardClass =
  "rounded-xl border border-line bg-surface p-6 shadow-card";

const SECTIONS = [
  { id: "profil", label: "Profil" },
  { id: "notifications", label: "Notifications" },
  { id: "confidentialite", label: "Confidentialité" },
  { id: "securite", label: "Sécurité" },
  { id: "compte", label: "Compte" },
];

const VISIBILITY_OPTIONS = [
  {
    value: "ANONYMOUS",
    label: "Anonyme",
    description: "Votre nom n'apparaît pas sur vos avis.",
  },
  {
    value: "PSEUDONYM",
    label: "Pseudonyme",
    description: "Un pseudonyme est affiché à la place de votre nom.",
  },
  {
    value: "NOMINATIVE",
    label: "Nominatif",
    description: "Votre nom affiché apparaît sur vos avis.",
  },
];

const ROLE_LABEL: Record<string, string> = {
  CONTRIBUTOR: "Contributeur",
  REPRESENTATIVE: "Représentant",
  MODERATOR: "Modérateur",
  ADMIN: "Administrateur",
};

const NOTICES: Record<string, string> = {
  profile: "Votre profil a été mis à jour.",
  notifications: "Vos préférences de notification ont été mises à jour.",
  privacy: "Vos paramètres de confidentialité ont été mis à jour.",
  password: "Votre mot de passe a été mis à jour.",
};

const ERRORS: Record<string, string> = {
  name: "Le nom doit contenir entre 2 et 30 caractères.",
  job: "Le poste ne doit pas dépasser 80 caractères.",
  salary: "La rémunération doit être un montant valide.",
  visibility: "Cette option de confidentialité n'est pas valide.",
  password: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
  current: "Le mot de passe actuel est incorrect.",
  confirm: "Les nouveaux mots de passe ne correspondent pas.",
  email: "L'adresse email saisie ne correspond pas à votre compte.",
  delete_confirm: "Veuillez cocher la case de confirmation.",
  delete_failed: "La suppression du compte a échoué. Réessayez.",
};

function initials(name: string) {
  const cleaned = name.replace(/@.*/, "");
  const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
  const letters = parts
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (letters || name[0] || "N").toUpperCase();
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 py-4">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
          {description}
        </span>
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="block h-6 w-11 rounded-full bg-line-strong transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/30 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition after:content-[''] peer-checked:after:translate-x-5" />
      </span>
    </label>
  );
}

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
    select: {
      name: true,
      email: true,
      role: true,
      createdAt: true,
      jobTitle: true,
      salary: true,
      notifyReplies: true,
      notifyHelpful: true,
      notifyNewsletter: true,
      notifyOffers: true,
      defaultVisibility: true,
      _count: { select: { reviews: true } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const notice = params.updated ? NOTICES[params.updated] : null;
  const error = params.error ? ERRORS[params.error] : null;
  const deleteError =
    params.error === "email" ||
    params.error === "delete_confirm" ||
    params.error === "delete_failed";

  const displayName = user.name ?? user.email;
  const roleLabel = ROLE_LABEL[user.role] ?? user.role;
  const memberSince = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(user.createdAt);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-ink text-paper">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(48% 80% at 88% 0%, rgba(20,184,166,0.12), transparent 70%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-7xl px-6 py-6 sm:py-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-teal">
                <span className="h-px w-8 bg-teal/70" aria-hidden="true" />
                Registre · Paramètres
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-paper sm:text-4xl">
                Paramètres
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-paper/55">
                Gérez votre profil, vos préférences de notification et la
                sécurité de votre compte.
              </p>
            </div>
            <p className="font-mono text-xs text-paper/55">{user.email}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6 py-8 sm:py-10">
        {notice ? (
          <p className="mb-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p className="mb-6 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold tracking-wide text-white">
                  {initials(displayName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {displayName}
                  </p>
                  <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    {roleLabel}
                  </p>
                  {user.jobTitle ? (
                    <p className="mt-1 truncate text-xs text-muted">
                      {user.jobTitle}
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="mt-4 border-t border-line pt-4 text-sm text-soft">
                {user._count.reviews}{" "}
                {user._count.reviews === 1 ? "avis" : "avis"}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Membre depuis {memberSince}
              </p>
            </div>

            <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Sommaire
            </p>
            <ScrollSpyNav
              items={SECTIONS}
              ariaLabel="Sections des paramètres"
              className="mt-3 space-y-1"
            />
          </aside>

          <div className="space-y-6">
            <section id="profil" className={cardClass}>
              <h2 className="text-xl font-extrabold tracking-tight text-ink">
                Profil
              </h2>
              <p className="mt-1 text-sm text-muted">
                Personnalisez les informations associées à votre compte.
              </p>

              <form action={updateProfile} className="mt-5 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="name">
                      Nom affiché
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      minLength={2}
                      maxLength={30}
                      defaultValue={user.name ?? ""}
                      autoComplete="name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      readOnly
                      className={`${inputClass} cursor-not-allowed bg-line/30`}
                    />
                    <p className="mt-1 text-xs text-muted">
                      L&apos;email ne peut pas être modifié ici.
                    </p>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="jobTitle">
                      Poste
                    </label>
                    <input
                      id="jobTitle"
                      name="jobTitle"
                      maxLength={80}
                      defaultValue={user.jobTitle ?? ""}
                      placeholder="Ex. Analyste risques"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="salary">
                      Rémunération mensuelle (XOF)
                    </label>
                    <input
                      id="salary"
                      name="salary"
                      type="number"
                      min={0}
                      max={100000000}
                      inputMode="numeric"
                      defaultValue={user.salary ?? ""}
                      placeholder="Ex. 450000"
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-muted">
                      Facultatif · aide les autres candidats à se faire un
                      aperçu des salaires pratiqués.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted">
                    Le nom affiché dans la navigation sera mis à jour à votre
                    prochaine connexion.
                  </p>
                  <button
                    type="submit"
                    className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
                  >
                    Enregistrer le profil
                  </button>
                </div>
              </form>
            </section>

            <section id="notifications" className={cardClass}>
              <h2 className="text-xl font-extrabold tracking-tight text-ink">
                Notifications
              </h2>
              <p className="mt-1 text-sm text-muted">
                Choisissez les emails que vous souhaitez recevoir de NEVALO.
              </p>

              <form
                action={updateNotifications}
                className="mt-4 divide-y divide-line"
              >
                <Toggle
                  name="notifyReplies"
                  label="Réponses à mes avis"
                  description="Recevoir un email lorsqu'une entreprise répond à l'un de vos avis."
                  defaultChecked={user.notifyReplies}
                />
                <Toggle
                  name="notifyHelpful"
                  label="Avis jugés utiles"
                  description="Être informé lorsque d'autres utilisateurs trouvent vos avis utiles."
                  defaultChecked={user.notifyHelpful}
                />
                <Toggle
                  name="notifyNewsletter"
                  label="Nouveautés NEVALO"
                  description="Recevoir les nouveautés de la plateforme et les temps forts de la communauté."
                  defaultChecked={user.notifyNewsletter}
                />
                <Toggle
                  name="notifyOffers"
                  label="Enquêtes et offres"
                  description="Participer à des enquêtes et recevoir des offres partenaires occasionnelles."
                  defaultChecked={user.notifyOffers}
                />
                <div className="flex justify-end pt-5">
                  <button
                    type="submit"
                    className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
                  >
                    Enregistrer les notifications
                  </button>
                </div>
              </form>
            </section>

            <section id="confidentialite" className={cardClass}>
              <h2 className="text-xl font-extrabold tracking-tight text-ink">
                Confidentialité
              </h2>
              <p className="mt-1 text-sm text-muted">
                Choisissez la visibilité par défaut appliquée à vos nouveaux
                avis.
              </p>

              <form action={updatePrivacy} className="mt-5 space-y-5">
                <fieldset>
                  <legend className="text-sm font-semibold text-ink">
                    Visibilité de mes avis
                  </legend>
                  <div className="mt-3 space-y-2">
                    {VISIBILITY_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-paper p-3 transition hover:border-line-strong has-[:checked]:border-accent has-[:checked]:bg-accent/5"
                      >
                        <input
                          type="radio"
                          name="defaultVisibility"
                          value={option.value}
                          defaultChecked={
                            user.defaultVisibility === option.value
                          }
                          className="mt-1 h-4 w-4 accent-accent"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-ink">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <p className="text-xs text-muted">
                  Cette préférence sera présélectionnée lors de la rédaction
                  d&apos;un nouvel avis. Vous pourrez la modifier au cas par cas.
                </p>

                <div className="flex justify-end border-t border-line pt-5">
                  <button
                    type="submit"
                    className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
                  >
                    Enregistrer la confidentialité
                  </button>
                </div>
              </form>
            </section>

            <section id="securite" className={cardClass}>
              <h2 className="text-xl font-extrabold tracking-tight text-ink">
                Sécurité
              </h2>
              <p className="mt-1 text-sm text-muted">
                Modifiez votre mot de passe. Utilisez au moins 8 caractères.
              </p>

              <form action={updatePassword} className="mt-5 space-y-4">
                <div>
                  <label className={labelClass} htmlFor="currentPassword">
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="newPassword">
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
                    <label className={labelClass} htmlFor="confirmPassword">
                      Confirmer le mot de passe
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
                </div>
                <div className="flex justify-end border-t border-line pt-5">
                  <button
                    type="submit"
                    className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
                  >
                    Changer le mot de passe
                  </button>
                </div>
              </form>
            </section>

            <section
              id="compte"
              className="rounded-xl border border-danger/30 bg-surface p-6 shadow-card"
            >
              <h2 className="text-xl font-extrabold tracking-tight text-danger">
                Supprimer mon compte
              </h2>
              <p className="mt-1 text-sm text-soft">
                Cette action est définitive. Tous vos avis, votes et réponses
                seront supprimés.
              </p>

              <details
                open={deleteError}
                className="mt-4 rounded-lg border border-line bg-paper p-4"
              >
                <summary className="cursor-pointer text-sm font-semibold text-ink">
                  Je souhaite supprimer mon compte
                </summary>
                <form action={deleteAccount} className="mt-4 space-y-4">
                  <div>
                    <label className={labelClass} htmlFor="deleteEmail">
                      Confirmez votre adresse email
                    </label>
                    <input
                      id="deleteEmail"
                      name="email"
                      type="email"
                      required
                      placeholder={user.email}
                      className={inputClass}
                    />
                  </div>
                  <label className="flex items-start gap-3 text-sm text-soft">
                    <input
                      type="checkbox"
                      name="confirm"
                      required
                      className="mt-0.5 h-4 w-4 accent-danger"
                    />
                    <span>
                      Je comprends que la suppression est définitive et que mes
                      avis seront supprimés.
                    </span>
                  </label>
                  <button
                    type="submit"
                    className="rounded-lg border border-danger bg-danger px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-danger/90"
                  >
                    Supprimer définitivement mon compte
                  </button>
                </form>
              </details>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
