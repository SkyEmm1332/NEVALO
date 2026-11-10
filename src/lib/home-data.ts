import { unstable_cache } from "next/cache";
import type { Criterion } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { COMPANIES_TAG, REVIEWS_TAG } from "@/lib/cache-tags";

export type HomeReview = {
  id: string;
  jobTitle: string;
  positives: string | null;
  negatives: string | null;
  comment: string | null;
  isCurrent: boolean;
  publishedAt: string | null;
  company: { name: string; slug: string | null };
  ratings: { criterion: Criterion; score: number }[];
};

export const getLatestReviews = unstable_cache(
  async (): Promise<HomeReview[]> => {
    const reviews = await prisma.review.findMany({
      where: {
        status: "PUBLISHED",
        company: { status: "PUBLISHED" },
      },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: {
        id: true,
        jobTitle: true,
        positives: true,
        negatives: true,
        comment: true,
        isCurrent: true,
        publishedAt: true,
        company: { select: { name: true, slug: true } },
        ratings: { select: { criterion: true, score: true } },
      },
    });

    return reviews.map((review) => ({
      ...review,
      publishedAt: review.publishedAt?.toISOString() ?? null,
    }));
  },
  ["latest-reviews"],
  { tags: [REVIEWS_TAG, COMPANIES_TAG], revalidate: 300 },
);

export const getHomeStats = unstable_cache(
  async () => {
    const [companyCount, reviewCount, userCount, sectors, cities] =
      await Promise.all([
        prisma.company.count({ where: { status: "PUBLISHED" } }),
        prisma.review.count({
          where: {
            status: "PUBLISHED",
            company: { status: "PUBLISHED" },
          },
        }),
        prisma.user.count(),
        prisma.company.groupBy({
          by: ["sector"],
          where: { status: "PUBLISHED", sector: { not: null } },
          _count: { _all: true },
        }),
        prisma.company.groupBy({
          by: ["city"],
          where: { status: "PUBLISHED", city: { not: null } },
          _count: { _all: true },
        }),
      ]);

    return {
      companyCount,
      reviewCount,
      userCount,
      sectorList: sectors
        .map((sector) => ({
          name: sector.sector as string,
          count: sector._count._all,
        }))
        .sort((a, b) => b.count - a.count),
      cityList: cities
        .map((city) => ({
          name: city.city as string,
          count: city._count._all,
        }))
        .sort((a, b) => b.count - a.count),
    };
  },
  ["home-stats"],
  { tags: [COMPANIES_TAG, REVIEWS_TAG], revalidate: 300 },
);
