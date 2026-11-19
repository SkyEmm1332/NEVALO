import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { COMPANIES_TAG, REVIEWS_TAG } from "@/lib/cache-tags";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  if (session.user.role !== "REPRESENTATIVE") {
    return NextResponse.json(
      { error: "Seule une entreprise peut répondre à un avis." },
      { status: 403 },
    );
  }

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  });

  if (!account?.companyId) {
    return NextResponse.json(
      { error: "Votre compte n'est lié à aucune entreprise." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const content = (body.content as string | undefined)?.trim();

  if (!content) {
    return NextResponse.json(
      { error: "Votre réponse ne peut pas être vide." },
      { status: 400 },
    );
  }

  if (content.length > 2000) {
    return NextResponse.json(
      { error: "Votre réponse ne peut pas dépasser 2 000 caractères." },
      { status: 400 },
    );
  }

  const review = await prisma.review.findFirst({
    where: { id, status: "PUBLISHED" },
    select: { id: true, companyId: true },
  });

  if (!review) {
    return NextResponse.json({ error: "Avis introuvable." }, { status: 404 });
  }

  if (review.companyId !== account.companyId) {
    return NextResponse.json(
      { error: "Vous ne pouvez répondre qu'aux avis de votre entreprise." },
      { status: 403 },
    );
  }

  try {
    const response = await prisma.reviewResponse.create({
      data: {
        reviewId: id,
        companyId: account.companyId,
        content,
      },
    });

    revalidateTag(COMPANIES_TAG, "max");
    revalidateTag(REVIEWS_TAG, "max");

    return NextResponse.json(
      {
        id: response.id,
        content: response.content,
        createdAt: response.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Impossible de publier votre réponse." },
      { status: 500 },
    );
  }
}
