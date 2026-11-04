import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { id } = await params;

  const review = await prisma.review.findFirst({
    where: { id, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!review) {
    return NextResponse.json({ error: "Avis introuvable." }, { status: 404 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.reviewLike.findUnique({
        where: {
          reviewId_userId: { reviewId: id, userId: session.user.id },
        },
      });

      if (existing) {
        await tx.reviewLike.delete({ where: { id: existing.id } });
      } else {
        await tx.reviewLike.create({
          data: { reviewId: id, userId: session.user.id },
        });
      }

      const count = await tx.reviewLike.count({ where: { reviewId: id } });
      return { liked: !existing, count };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer ce vote." },
      { status: 500 },
    );
  }
}
