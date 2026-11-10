import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { computeGlobalScore } from "@/lib/rating";
import { COMPANIES_TAG } from "@/lib/cache-tags";

export type CompanyWithScore = {
  id: string;
  name: string;
  slug: string | null;
  sector: string | null;
  city: string | null;
  size: string | null;
  score: number | null;
  reviewCount: number;
};

const getCachedCompanies = unstable_cache(
  async (): Promise<CompanyWithScore[]> => {
    const companies = await prisma.company.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        sector: true,
        city: true,
        size: true,
        reviews: {
          where: { status: "PUBLISHED" },
          select: {
            ratings: { select: { criterion: true, score: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return companies.map((c) => {
      const ratings = c.reviews.flatMap((r) => r.ratings);
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        sector: c.sector,
        city: c.city,
        size: c.size,
        score: computeGlobalScore(ratings),
        reviewCount: c.reviews.length,
      };
    });
  },
  ["companies-with-score"],
  { tags: [COMPANIES_TAG], revalidate: 300 },
);

export async function getCompaniesWithScore(filters?: {
  q?: string;
  sector?: string;
  city?: string;
}): Promise<CompanyWithScore[]> {
  const companies = await getCachedCompanies();
  if (!filters) return companies;

  const q = filters.q?.trim().toLowerCase();
  const sector = filters.sector?.toLowerCase();
  const city = filters.city?.toLowerCase();

  if (!q && !sector && !city) return companies;

  return companies.filter((company) => {
    if (q) {
      const haystack = `${company.name} ${company.sector ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (sector && (company.sector ?? "").toLowerCase() !== sector) return false;
    if (city && (company.city ?? "").toLowerCase() !== city) return false;
    return true;
  });
}

export async function getCompanyFacets(): Promise<{
  sectors: string[];
  cities: string[];
}> {
  const companies = await getCachedCompanies();

  const sectors = Array.from(
    new Set(
      companies
        .map((company) => company.sector)
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const cities = Array.from(
    new Set(
      companies
        .map((company) => company.city)
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return { sectors, cities };
}
