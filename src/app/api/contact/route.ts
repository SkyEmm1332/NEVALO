import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = (body.name as string)?.trim();
    const email = (body.email as string)?.trim();
    const phone = (body.phone as string)?.trim();
    const subject = (body.subject as string)?.trim() || null;
    const message = (body.message as string)?.trim();

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: "Nom, email, téléphone et message sont requis." },
        { status: 400 },
      );
    }

    await prisma.contactMessage.create({
      data: { name, email, phone, subject, message },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 },
    );
  }
}
