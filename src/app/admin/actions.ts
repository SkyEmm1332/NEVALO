"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { COMPANIES_TAG, REVIEWS_TAG } from "@/lib/cache-tags";
import { slugify } from "@/lib/slug";
import type { CompanyStatus, ReviewStatus, UserRole } from "@prisma/client";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié.");
  if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    throw new Error("Accès refusé.");
  }
}

export async function setCompanyStatus(formData: FormData) {
  await assertAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as CompanyStatus;

  await prisma.company.update({ where: { id }, data: { status } });

  updateTag(COMPANIES_TAG);
  updateTag(REVIEWS_TAG);
  revalidatePath("/admin/entreprises");
  revalidatePath("/admin");
  revalidatePath("/entreprises");
  revalidatePath("/");
}

export async function createCompany(formData: FormData) {
  await assertAdmin();
  const name = (formData.get("name") as string).trim();
  const sector = (formData.get("sector") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const size = (formData.get("size") as string)?.trim() || null;
  const website = (formData.get("website") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const status = (formData.get("status") as CompanyStatus) || "PUBLISHED";

  if (!name) return;

  let slug = slugify(name);
  const existing = await prisma.company.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await prisma.company.create({
    data: { name, slug, sector, city, size, website, description, status },
  });

  updateTag(COMPANIES_TAG);
  updateTag(REVIEWS_TAG);
  revalidatePath("/admin/entreprises");
  revalidatePath("/admin");
  revalidatePath("/entreprises");
  revalidatePath("/");
}

export async function updateCompany(formData: FormData) {
  await assertAdmin();
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();

  if (!id || !name) return;

  const invitesRaw = formData.get("invitesClientReviews") as string;
  const invitesClientReviews =
    invitesRaw === "" ? null : invitesRaw === "true";
  const status = (formData.get("status") as CompanyStatus) || "PENDING";

  await prisma.company.update({
    where: { id },
    data: {
      name,
      sector: (formData.get("sector") as string)?.trim() || null,
      city: (formData.get("city") as string)?.trim() || null,
      size: (formData.get("size") as string)?.trim() || null,
      website: (formData.get("website") as string)?.trim() || null,
      email: (formData.get("email") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      address: (formData.get("address") as string)?.trim() || null,
      description: (formData.get("description") as string)?.trim() || null,
      reviewInvitationDetails:
        (formData.get("reviewInvitationDetails") as string)?.trim() || null,
      invitesClientReviews,
      claimed: formData.get("claimed") === "on",
      status,
    },
  });

  updateTag(COMPANIES_TAG);
  updateTag(REVIEWS_TAG);
  revalidatePath("/admin/entreprises");
  revalidatePath(`/admin/entreprises/${id}`);
  revalidatePath("/admin");
  revalidatePath("/entreprises");
  revalidatePath("/");
  redirect("/admin/entreprises");
}

export async function setReviewStatus(formData: FormData) {
  await assertAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as ReviewStatus;

  const data: { status: ReviewStatus; publishedAt?: Date | null } = { status };
  if (status === "PUBLISHED") data.publishedAt = new Date();
  if (status === "REJECTED") data.publishedAt = null;

  await prisma.review.update({ where: { id }, data });

  updateTag(COMPANIES_TAG);
  updateTag(REVIEWS_TAG);
  revalidatePath("/admin/avis");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function setUserRole(formData: FormData) {
  await assertAdmin();
  const id = formData.get("id") as string;
  const role = formData.get("role") as UserRole;

  await prisma.user.update({ where: { id }, data: { role } });

  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin");
}

export async function markMessageRead(formData: FormData) {
  await assertAdmin();
  const id = formData.get("id") as string;

  await prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });

  revalidatePath("/admin/messages");
}
