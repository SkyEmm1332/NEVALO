"use server";

import bcrypt from "bcryptjs";
import { Visibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

const SETTINGS_PATH = "/mon-espace/parametres";
const VISIBILITIES = new Set<Visibility>([
  Visibility.ANONYMOUS,
  Visibility.PSEUDONYM,
  Visibility.NOMINATIVE,
]);

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${SETTINGS_PATH}`);
  }

  const name = String(formData.get("name") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const salaryInput = String(formData.get("salary") ?? "").trim();
  const salary = salaryInput ? Number(salaryInput) : null;

  if (name.length < 2 || name.length > 30) {
    redirect(`${SETTINGS_PATH}?error=name#profil`);
  }
  if (jobTitle.length > 80) {
    redirect(`${SETTINGS_PATH}?error=job#profil`);
  }
  if (
    salary !== null &&
    (!Number.isInteger(salary) || salary < 0 || salary > 100_000_000)
  ) {
    redirect(`${SETTINGS_PATH}?error=salary#profil`);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      jobTitle: jobTitle || null,
      salary,
    },
  });

  revalidatePath(SETTINGS_PATH);
  revalidatePath("/mon-espace");
  redirect(`${SETTINGS_PATH}?updated=profile#profil`);
}

export async function updateNotifications(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${SETTINGS_PATH}`);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      notifyReplies: formData.get("notifyReplies") === "on",
      notifyHelpful: formData.get("notifyHelpful") === "on",
      notifyNewsletter: formData.get("notifyNewsletter") === "on",
      notifyOffers: formData.get("notifyOffers") === "on",
    },
  });

  revalidatePath(SETTINGS_PATH);
  redirect(`${SETTINGS_PATH}?updated=notifications#notifications`);
}

export async function updatePrivacy(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${SETTINGS_PATH}`);
  }

  const visibility = String(formData.get("defaultVisibility") ?? "");

  if (!VISIBILITIES.has(visibility as Visibility)) {
    redirect(`${SETTINGS_PATH}?error=visibility#confidentialite`);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      defaultVisibility: visibility as Visibility,
    },
  });

  revalidatePath(SETTINGS_PATH);
  redirect(`${SETTINGS_PATH}?updated=privacy#confidentialite`);
}

export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${SETTINGS_PATH}`);
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || newPassword.length < 8) {
    redirect(`${SETTINGS_PATH}?error=password#securite`);
  }

  if (newPassword !== confirmPassword) {
    redirect(`${SETTINGS_PATH}?error=confirm#securite`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) {
    redirect(`${SETTINGS_PATH}?error=password#securite`);
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    redirect(`${SETTINGS_PATH}?error=current#securite`);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  redirect(`${SETTINGS_PATH}?updated=password#securite`);
}

export async function deleteAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${SETTINGS_PATH}`);
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const confirmed = formData.get("confirm") === "on";

  if (!confirmed) {
    redirect(`${SETTINGS_PATH}?error=delete_confirm#compte`);
  }

  if (!session.user.email || email !== session.user.email.trim().toLowerCase()) {
    redirect(`${SETTINGS_PATH}?error=email#compte`);
  }

  const deleted = await prisma.user.deleteMany({
    where: { id: session.user.id },
  });

  if (deleted.count === 0) {
    redirect(`${SETTINGS_PATH}?error=delete_failed#compte`);
  }

  await signOut({ redirectTo: "/login?deleted=1" });
}
