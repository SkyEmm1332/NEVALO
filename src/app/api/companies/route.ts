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
  const email = (body.email as string)?.trim() || null;
  const phone = (body.phone as string)?.trim() || null;
  const address = (body.address as string)?.trim() || null;
  const description = (body.description as string)?.trim() || null;

  if (!name) {
    return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
  }

  const existing = await prisma.company.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) {
    if (existing.status === "REJECTED") {
      return NextResponse.json(
        { error: "Cette entreprise a été rejetée." },
        { status: 409 },
      );
    }
    return NextResponse.json({ id: existing.id, name: existing.name });
  }

  let slug = slugify(name);
  const slugOwner = await prisma.company.findUnique({ where: { slug } });
  if (slugOwner) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const company = await prisma.company.create({
    data: {
      name,
      slug,
      sector,
      city,
      size,
      website,
      email,
      phone,
      address,
      description,
      status: "PENDING",
    },
  });

  return NextResponse.json(
    { id: company.id, name: company.name },
    { status: 201 },
  );
}
