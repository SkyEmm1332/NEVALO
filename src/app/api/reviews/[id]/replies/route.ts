import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
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
    select: { id: true },
  });
  if (!review) {
    return NextResponse.json({ error: "Avis introuvable." }, { status: 404 });
  }

  try {
    const reply = await prisma.reviewReply.create({
      data: {
        reviewId: id,
        authorId: session.user.id,
        content,
      },
      include: { author: { select: { name: true } } },
    });

    return NextResponse.json(
      {
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        authorName: reply.author.name,
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
