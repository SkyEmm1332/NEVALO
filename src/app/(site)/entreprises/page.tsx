import { getCompaniesWithScore, getCompanyFacets } from "@/lib/companies";
import { CompanyCompare } from "@/components/CompanyCompare";
import { PageHero } from "@/components/PageHero";

export default async function EntreprisesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sector?: string; city?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? undefined;

  const [companies, { sectors: sectorList, cities: cityList }] =
    await Promise.all([
      getCompaniesWithScore({ q, sector: params.sector, city: params.city }),
      getCompanyFacets(),
    ]);

  return (
    <>
      <PageHero
        eyebrow="Registre · Annuaire"
        title="Entreprises"
        description="Trouvez l'entreprise qui vous ressemble, avant de vous engager. Filtrez par secteur et par ville, puis comparez les notes."
        stats={[
          { value: String(companies.length), label: "résultats" },
          { value: String(sectorList.length), label: "secteurs" },
          { value: String(cityList.length), label: "villes" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-14">
        <form
          action="/entreprises"
          method="GET"
          className="grid gap-3 border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Rechercher…"
            className="border border-line bg-paper px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-ink"
          />
          <select
            name="sector"
            defaultValue={params.sector ?? ""}
            className="border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-ink"
          >
            <option value="">Tous les secteurs</option>
            {sectorList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="city"
            defaultValue={params.city ?? ""}
            className="border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-ink"
          >
            <option value="">Toutes les villes</option>
            {cityList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
          >
            Filtrer
          </button>
        </form>

        <p className="mt-8 font-mono text-xs uppercase tracking-wide text-muted">
          {companies.length} entreprise{companies.length > 1 ? "s" : ""} trouvée
          {companies.length > 1 ? "s" : ""}
        </p>

        {companies.length === 0 ? (
          <p className="mt-8 border border-dashed border-line-strong bg-surface p-12 text-center text-muted">
            Aucune entreprise ne correspond à votre recherche.
          </p>
        ) : (
          <CompanyCompare companies={companies} />
        )}
      </div>
    </>
  );
}

