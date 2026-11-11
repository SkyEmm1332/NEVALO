"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SETTINGS_PATH = "/mon-espace/parametres";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${SETTINGS_PATH}`);
  }

  const name = (formData.get("name") as string)?.trim() ?? "";
  if (name.length < 2) {
    redirect(`${SETTINGS_PATH}?error=name`);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  revalidatePath(SETTINGS_PATH);
  revalidatePath("/mon-espace");
  redirect(`${SETTINGS_PATH}?updated=profile`);
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
    redirect(`${SETTINGS_PATH}?error=password`);
  }

  if (newPassword !== confirmPassword) {
    redirect(`${SETTINGS_PATH}?error=confirm`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) {
    redirect(`${SETTINGS_PATH}?error=password`);
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    redirect(`${SETTINGS_PATH}?error=current`);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  redirect(`${SETTINGS_PATH}?updated=password`);
}
