import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCompany } from "@/app/admin/actions";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/entreprises"
            className="text-sm text-accent hover:underline"
          >
            ← Retour aux entreprises
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{company.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {company._count.reviews} avis · fiche créée le{" "}
            {company.createdAt.toLocaleDateString("fr-FR")}
          </p>
        </div>
        {company.status === "PUBLISHED" && company.slug ? (
          <Link
            href={`/entreprises/${company.slug}`}
            className="rounded-md border border-line px-3 py-2 text-sm font-medium text-soft transition hover:border-ink hover:text-ink"
          >
            Voir la fiche publique
          </Link>
        ) : null}
      </div>

      <form
        action={updateCompany}
        className="rounded-lg border border-line bg-surface p-6"
      >
        <input type="hidden" name="id" value={company.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold" htmlFor="name">
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
            <label className="block text-sm font-semibold" htmlFor="status">
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
            <label className="block text-sm font-semibold" htmlFor="sector">
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
            <label className="block text-sm font-semibold" htmlFor="size">
              Effectif
            </label>
            <input
              id="size"
              name="size"
              defaultValue={company.size ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="city">
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
            <label className="block text-sm font-semibold" htmlFor="address">
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
            <label className="block text-sm font-semibold" htmlFor="website">
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
            <label className="block text-sm font-semibold" htmlFor="email">
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
            <label className="block text-sm font-semibold" htmlFor="phone">
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
          <div>
            <label
              className="block text-sm font-semibold"
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
          <div className="sm:col-span-2">
            <label
              className="block text-sm font-semibold"
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
          <div className="sm:col-span-2">
            <label
              className="block text-sm font-semibold"
              htmlFor="reviewInvitationDetails"
            >
              Détails sur l&apos;invitation aux avis clients
            </label>
            <textarea
              id="reviewInvitationDetails"
              name="reviewInvitationDetails"
              rows={2}
              defaultValue={company.reviewInvitationDetails ?? ""}
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-soft sm:col-span-2">
            <input
              type="checkbox"
              name="claimed"
              defaultChecked={company.claimed}
              className="h-4 w-4 border-line text-accent"
            />
            Fiche revendiquée par l&apos;entreprise
          </label>
          <p className="text-xs text-muted sm:col-span-2">
            Vérifiez le site, les coordonnées et les informations de la fiche
            avant de la passer au statut « Publiée ».
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
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
        </div>
      </form>
    </div>
  );
}
