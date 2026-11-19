"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { COVERS } from "@/lib/images";
import { COMPANIES_TAG } from "@/lib/cache-tags";

const EDIT_PATH = "/mon-espace/entreprise/parametres";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const UPLOAD_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function parsePosition(value: string | null | undefined) {
  const match = /(\d{1,3})%\s+(\d{1,3})%/.exec(value ?? "");
  if (!match) return null;
  const x = Math.max(0, Math.min(100, Number(match[1])));
  const y = Math.max(0, Math.min(100, Number(match[2])));
  return `${x}% ${y}%`;
}

async function resolveCompany(userId: string) {
  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });

  if (!account?.companyId) return null;

  return prisma.company.findUnique({
    where: { id: account.companyId },
    select: { id: true, slug: true },
  });
}

async function saveUpload(
  directory: string,
  filename: string,
  file: File,
): Promise<{ url: string } | null> {
  if (!file || file.size === 0) return null;

  const extension = UPLOAD_EXTENSIONS[file.type];
  if (!extension || file.size > MAX_UPLOAD_BYTES) {
    throw new Error("invalid_upload");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", directory);
  await mkdir(uploadDir, { recursive: true });

  const savedName = `${filename}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, savedName), buffer);

  return { url: `/uploads/${directory}/${savedName}` };
}

export async function updateCompanyFiche(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${EDIT_PATH}`);
  }

  if (session.user.role !== "REPRESENTATIVE") {
    redirect("/mon-espace");
  }

  const company = await resolveCompany(session.user.id);
  if (!company) {
    redirect(EDIT_PATH);
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const sector = String(formData.get("sector") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();

  if (name.length < 2) {
    redirect(`${EDIT_PATH}?error=name`);
  }

  const coverKeyValue = String(formData.get("coverKey") ?? "");
  const coverKey = COVERS.some((cover) => cover.key === coverKeyValue)
    ? coverKeyValue
    : null;

  const logo = formData.get("logo") as File | null;
  const banner = formData.get("banner") as File | null;

  let logoUrl: string | undefined;
  let logoPosition: string | undefined;
  let coverUrl: string | null | undefined;
  let coverKeyFinal: string | null | undefined;
  let bannerPosition: string | undefined;

  try {
    const savedLogo = await saveUpload(
      "logos",
      `logo-${company.id}`,
      logo as File,
    );
    if (savedLogo) {
      logoUrl = savedLogo.url;
      logoPosition =
        parsePosition(String(formData.get("logoPosition") ?? "")) ??
        "50% 50%";
    }

    const savedBanner = await saveUpload(
      "covers",
      `banner-${company.id}`,
      banner as File,
    );
    if (savedBanner) {
      coverUrl = savedBanner.url;
      bannerPosition =
        parsePosition(String(formData.get("bannerPosition") ?? "")) ??
        "50% 50%";
      coverKeyFinal = null;
    } else if (coverKey) {
      coverKeyFinal = coverKey;
      coverUrl = null;
    }
  } catch {
    redirect(`${EDIT_PATH}?error=upload`);
  }

  await prisma.company.update({
    where: { id: company.id },
    data: {
      name,
      description: description || null,
      website: website || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      sector: sector || null,
      size: size || null,
      ...(coverKeyFinal !== undefined ? { coverKey: coverKeyFinal } : {}),
      ...(coverUrl !== undefined ? { coverUrl } : {}),
      ...(logoUrl ? { logoUrl } : {}),
      ...(logoPosition ? { logoPosition } : {}),
      ...(bannerPosition ? { bannerPosition } : {}),
    },
  });

  revalidatePath("/mon-espace/entreprise");
  revalidatePath(EDIT_PATH);
  if (company.slug) {
    revalidatePath(`/entreprises/${company.slug}`);
  }
  revalidateTag(COMPANIES_TAG, "max");

  redirect(`${EDIT_PATH}?updated=1`);
}
