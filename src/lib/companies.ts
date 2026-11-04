import { prisma } from "@/lib/prisma";
import { computeGlobalScore } from "@/lib/rating";

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

export async function getCompaniesWithScore(
  filters?: { q?: string; sector?: string; city?: string },
): Promise<CompanyWithScore[]> {
  const where = {
    status: "PUBLISHED" as const,
    ...(filters?.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" as const } },
            { sector: { contains: filters.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters?.sector
      ? { sector: { equals: filters.sector, mode: "insensitive" as const } }
      : {}),
    ...(filters?.city
      ? { city: { equals: filters.city, mode: "insensitive" as const } }
      : {}),
  };

  const companies = await prisma.company.findMany({
    where,
    include: {
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
}
