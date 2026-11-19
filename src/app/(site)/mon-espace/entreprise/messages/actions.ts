"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MESSAGES_PATH = "/mon-espace/entreprise/messages";

async function requireCompanyId() {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${MESSAGES_PATH}`);
  }
  if (session.user.role !== "REPRESENTATIVE") {
    redirect("/mon-espace");
  }
  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  });
  if (!account?.companyId) {
    redirect("/mon-espace/entreprise");
  }
  return account.companyId;
}

export async function createCompanyThread(formData: FormData) {
  const companyId = await requireCompanyId();

  const subject = String(formData.get("subject") ?? "").trim().slice(0, 120);
  const content = String(formData.get("content") ?? "").trim();

  if (!subject || !content || content.length > 2000) {
    redirect(`${MESSAGES_PATH}/nouveau?error=1`);
  }

  const thread = await prisma.companyThread.create({
    data: {
      companyId,
      subject,
      messages: { create: { sender: "COMPANY", content } },
    },
  });

  revalidatePath(MESSAGES_PATH);
  redirect(`${MESSAGES_PATH}/${thread.id}`);
}

export async function replyCompanyThread(formData: FormData) {
  const companyId = await requireCompanyId();

  const threadId = String(formData.get("threadId") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!threadId || !content || content.length > 2000) {
    redirect(`${MESSAGES_PATH}/${threadId}?error=1`);
  }

  const thread = await prisma.companyThread.findFirst({
    where: { id: threadId, companyId },
    select: { id: true },
  });

  if (!thread) {
    redirect(MESSAGES_PATH);
  }

  await prisma.companyMessage.create({
    data: { threadId, sender: "COMPANY", content },
  });

  revalidatePath(`${MESSAGES_PATH}/${threadId}`);
  redirect(`${MESSAGES_PATH}/${threadId}`);
}
