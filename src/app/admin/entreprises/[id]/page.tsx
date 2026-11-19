import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { updateCompany } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  COMPANY_STATUS_META,
  TONE_DOT,
  adminInitial,
  type AdminTone,
} from "@/lib/admin-ui";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent";

function FormSection({
  title,
  description,
  tone,
  children,
}: {
  title: string;
  description: string;
  tone: AdminTone;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="border-b border-line p-5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[tone]}`}
          />
          <h2 className="font-semibold text-ink">{title}</h2>
        </div>
        <p className="mt-1 text-xs text-muted">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default async function AdminCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: { _count: { select: { reviews: true } } },
  });

  if (!company) notFound();

  const companyStatus = COMPANY_STATUS_META[company.status];
  const createdAt = company.createdAt.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const isPublic = company.status === "PUBLISHED" && Boolean(company.slug);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/entreprises"
          className="text-xs font-medium text-accent transition hover:underline"
        >
          ← Toutes les entreprises
        </Link>
        <div className="mt-3">
          <AdminPageHeader
            title={company.name}
            description={`${company._count.reviews} avis · fiche créée le ${createdAt}`}
            badge={{ label: companyStatus.label, tone: companyStatus.tone }}
            actions={
              isPublic ? (
                <Link
                  href={`/entreprises/${company.slug}`}
                  className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-soft transition hover:border-ink hover:text-ink"
                >
                  Voir la fiche publique
                </Link>
              ) : undefined
            }
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <form action={updateCompany} className="space-y-4">
          <input type="hidden" name="id" value={company.id} />

          <FormSection
            title="Identité de la fiche"
            description="Nom, positionnement et présentation de l’entreprise."
            tone="accent"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-ink" htmlFor="name">
                  Nom *
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  defaultValue={company.name}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="status"
                >
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={company.status}
                  className={inputClass}
                >
                  <option value="PENDING">En attente</option>
                  <option value="PUBLISHED">Publiée</option>
                  <option value="REJECTED">Rejetée</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="sector"
                >
                  Secteur
                </label>
                <input
                  id="sector"
                  name="sector"
                  defaultValue={company.sector ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="size"
                >
                  Effectif
                </label>
                <input
                  id="size"
                  name="size"
                  defaultValue={company.size ?? ""}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={company.description ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Coordonnées"
            description="Informations publiques de contact et localisation."
            tone="blue"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="city"
                >
                  Ville
                </label>
                <input
                  id="city"
                  name="city"
                  defaultValue={company.city ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="address"
                >
                  Adresse
                </label>
                <input
                  id="address"
                  name="address"
                  defaultValue={company.address ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="website"
                >
                  Site web
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={company.website ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="email"
                >
                  Email de contact
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={company.email ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="phone"
                >
                  Téléphone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={company.phone ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Avis clients"
            description="Paramètres de collecte et statut de revendication de la fiche."
            tone="gold"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="invitesClientReviews"
                >
                  Demande des avis aux clients
                </label>
                <select
                  id="invitesClientReviews"
                  name="invitesClientReviews"
                  defaultValue={
                    company.invitesClientReviews === null
                      ? ""
                      : String(company.invitesClientReviews)
                  }
                  className={inputClass}
                >
                  <option value="">Non renseigné</option>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>

              <label className="flex items-center gap-2 self-end rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-soft">
                <input
                  type="checkbox"
                  name="claimed"
                  defaultChecked={company.claimed}
                  className="h-4 w-4 border-line text-accent"
                />
                Fiche revendiquée par l’entreprise
              </label>

              <div className="sm:col-span-2">
                <label
                  className="block text-sm font-semibold text-ink"
                  htmlFor="reviewInvitationDetails"
                >
                  Détails sur l’invitation aux avis clients
                </label>
                <textarea
                  id="reviewInvitationDetails"
                  name="reviewInvitationDetails"
                  rows={2}
                  defaultValue={company.reviewInvitationDetails ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
          </FormSection>

          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-4">
            <button
              type="submit"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep"
            >
              Enregistrer
            </button>
            <Link
              href="/admin/entreprises"
              className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-soft transition hover:border-ink hover:text-ink"
            >
              Annuler
            </Link>
            <p className="ml-auto text-xs text-muted">
              Les champs marqués * sont obligatoires.
            </p>
          </div>
        </form>

        <aside className="space-y-4 xl:sticky xl:top-20">
          <section className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-line p-4">
              <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
                Aperçu
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 font-mono text-sm font-semibold text-[#96680f]">
                  {adminInitial(company.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {company.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {company.sector ?? "Secteur non renseigné"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <AdminStatusBadge
                  label={companyStatus.label}
                  tone={companyStatus.tone}
                />
                <span className="font-mono text-xs text-muted">
                  {company._count.reviews} avis
                </span>
              </div>

              <dl className="mt-4 space-y-2 border-t border-line pt-4 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Ville</dt>
                  <dd className="truncate font-medium text-soft">
                    {company.city ?? "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Effectif</dt>
                  <dd className="truncate font-medium text-soft">
                    {company.size ?? "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Créée le</dt>
                  <dd className="font-medium text-soft">{createdAt}</dd>
                </div>
              </dl>

              {!isPublic ? (
                <p className="mt-4 rounded-md border border-gold/20 bg-gold/10 px-3 py-2 text-xs leading-relaxed text-soft">
                  La fiche n’est pas visible publiquement tant qu’elle n’est pas
                  publiée.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-paper p-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
              Conseil
            </p>
            <p className="mt-2 text-xs leading-relaxed text-soft">
              Vérifiez le site, les coordonnées et les informations de la fiche
              avant de la passer au statut « Publiée ».
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
