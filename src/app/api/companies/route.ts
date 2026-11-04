import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json();
  const name = (body.name as string)?.trim();
  const sector = (body.sector as string)?.trim() || null;
  const city = (body.city as string)?.trim() || null;
  const size = (body.size as string)?.trim() || null;
  const website = (body.website as string)?.trim() || null;
  const description = (body.description as string)?.trim() || null;

  if (!name) {
    return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
  }

  const slug = slugify(name);

  const existing = await prisma.company.findFirst({
    where: { OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Cette entreprise existe déjà." },
      { status: 409 },
    );
  }

  const company = await prisma.company.create({
    data: {
      name,
      slug,
      sector,
      city,
      size,
      website,
      description,
      status: "PENDING",
    },
  });

  return NextResponse.json({ id: company.id }, { status: 201 });
}
