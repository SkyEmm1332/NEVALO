import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isReportReason,
  REPORT_DETAILS_MAX_LENGTH,
  REPORT_OTHER_REASON,
} from "@/lib/reports";

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
  const reason = (body.reason as string | undefined)?.trim();
  const details = (body.details as string | undefined)?.trim() || null;

  if (!isReportReason(reason)) {
    return NextResponse.json(
      { error: "Choisissez un motif de signalement." },
      { status: 400 },
    );
  }

  if (reason === REPORT_OTHER_REASON && !details) {
    return NextResponse.json(
      { error: "Précisez le motif de votre signalement." },
      { status: 400 },
    );
  }

  if (details && details.length > REPORT_DETAILS_MAX_LENGTH) {
    return NextResponse.json(
      {
        error: `Les précisions ne peuvent pas dépasser ${REPORT_DETAILS_MAX_LENGTH} caractères.`,
      },
      { status: 400 },
    );
  }

  const review = await prisma.review.findFirst({
    where: { id, status: "PUBLISHED" },
    select: { id: true, authorId: true },
  });

  if (!review) {
    return NextResponse.json({ error: "Avis introuvable." }, { status: 404 });
  }

  if (review.authorId === session.user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas signaler votre propre avis." },
      { status: 400 },
    );
  }

  const existing = await prisma.report.findFirst({
    where: {
      reviewId: id,
      reporterId: session.user.id,
      status: "OPEN",
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      {
        error:
          "Vous avez déjà signalé cet avis. Notre équipe examine votre demande.",
      },
      { status: 409 },
    );
  }

  try {
    const report = await prisma.report.create({
      data: {
        reviewId: id,
        reporterId: session.user.id,
        reason,
        details,
      },
      select: { id: true, createdAt: true },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/avis");
    revalidatePath(`/admin/avis/${id}`);

    return NextResponse.json(
      { id: report.id, createdAt: report.createdAt.toISOString() },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer votre signalement." },
      { status: 500 },
    );
  }
}
