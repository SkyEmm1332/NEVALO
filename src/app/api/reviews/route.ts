import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { COMPANIES_TAG, REVIEWS_TAG } from "@/lib/cache-tags";
import type { Criterion, Visibility } from "@prisma/client";

const CRITERIA: Criterion[] = [
  "AMBIANCE",
  "MANAGEMENT",
  "REMUNERATION",
  "EVOLUTION",
  "WORKLOAD",
  "WORK_LIFE_BALANCE",
  "RECOGNITION",
  "WORK_CONDITIONS",
  "STABILITY",
];

const VISIBILITIES: Visibility[] = ["ANONYMOUS", "PSEUDONYM", "NOMINATIVE"];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json();
  const companyId = body.companyId as string;
  const jobTitle = (body.jobTitle as string)?.trim();
  const ratings = body.ratings as Record<Criterion, number> | undefined;
  const visibility = body.visibility as Visibility;

  if (!companyId || !jobTitle) {
    return NextResponse.json(
      { error: "Entreprise et poste sont requis." },
      { status: 400 },
    );
  }

  if (!ratings || !VISIBILITIES.includes(visibility)) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const ratingRows = CRITERIA.map((criterion) => {
    const score = Number(ratings[criterion]);
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      throw new Error("Note invalide");
    }
    return { criterion, score };
  });

  const salary = body.salary as
    | { amount: number; isNet: boolean; period: "MONTHLY" | "YEARLY" }
    | null
    | undefined;

  try {
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          authorId: session.user.id,
          companyId,
          jobTitle,
          contractType: (body.contractType as string) || null,
          location: (body.location as string)?.trim() || null,
          isCurrent: Boolean(body.isCurrent),
          recommend:
            typeof body.recommend === "boolean" ? body.recommend : null,
          visibility,
          status: "PUBLISHED",
          title: null,
          positives: (body.positives as string)?.trim() || null,
          negatives: (body.negatives as string)?.trim() || null,
          comment: (body.comment as string)?.trim() || null,
          publishedAt: new Date(),
          ratings: { create: ratingRows },
        },
      });

      if (salary && salary.amount > 0) {
        await tx.salaryReport.create({
          data: {
            reviewId: created.id,
            companyId,
            jobTitle,
            amount: salary.amount,
            isNet: salary.isNet,
            period: salary.period,
          },
        });
      }

      return created;
    });

    revalidateTag(COMPANIES_TAG, "max");
    revalidateTag(REVIEWS_TAG, "max");

    return NextResponse.json({ id: review.id }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Note invalide") {
      return NextResponse.json({ error: "Note invalide." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 },
    );
  }
}
