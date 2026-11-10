import { prisma } from "@/lib/prisma";
import { setCompanyStatus, createCompany } from "@/app/admin/actions";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "Publiée", className: "bg-accent/10 text-accent" },
  PENDING: { label: "En attente", className: "bg-gold/15 text-[#96680f]" },
  REJECTED: { label: "Rejetée", className: "bg-danger/10 text-danger" },
};

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: { _count: { select: { reviews: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Entreprises</h1>
        <p className="mt-1 text-sm text-muted">
          Validez, rejetez ou créez des fiches entreprises.
        </p>
      </div>

      <section className="rounded-lg border border-line bg-surface p-6">
        <h2 className="font-semibold">Créer une entreprise</h2>
        <form action={createCompany} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Nom *"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="sector"
            placeholder="Secteur"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="city"
            placeholder="Ville"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="size"
            placeholder="Taille"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="website"
            placeholder="Site web"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2"
          />
          <textarea
            name="description"
            placeholder="Description"
            rows={2}
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2"
          />
          <select
            name="status"
            defaultValue="PUBLISHED"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="PUBLISHED">Publier directement</option>
            <option value="PENDING">Mettre en attente</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-deep"
          >
            Créer
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Ville</th>
              <th className="px-4 py-3 font-medium">Avis</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {companies.map((c) => {
              const status = STATUS_LABEL[c.status] ?? STATUS_LABEL.PENDING;
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted">{c.city ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{c._count.reviews}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {c.status !== "PUBLISHED" ? (
                        <form action={setCompanyStatus}>
                          <input type="hidden" name="id" value={c.id} />
                          <button
                            type="submit"
                            name="status"
                            value="PUBLISHED"
                            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-deep"
                          >
                            Publier
                          </button>
                        </form>
                      ) : (
                        <form action={setCompanyStatus}>
                          <input type="hidden" name="id" value={c.id} />
                          <button
                            type="submit"
                            name="status"
                            value="PENDING"
                            className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-medium text-soft hover:bg-line"
                          >
                            Masquer
                          </button>
                        </form>
                      )}
                      {c.status !== "REJECTED" ? (
                        <form action={setCompanyStatus}>
                          <input type="hidden" name="id" value={c.id} />
                          <button
                            type="submit"
                            name="status"
                            value="REJECTED"
                            className="rounded-md border border-danger/30 bg-danger/5 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
                          >
                            Rejeter
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
