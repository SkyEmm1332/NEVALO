"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function replyCompanyThread(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    redirect("/");
  }

  const threadId = String(formData.get("threadId") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!threadId || !content || content.length > 2000) {
    redirect(`/admin/requetes/${threadId}?error=1`);
  }

  const thread = await prisma.companyThread.findUnique({
    where: { id: threadId },
    select: { id: true, companyId: true },
  });

  if (!thread) {
    redirect("/admin/requetes");
  }

  await prisma.$transaction([
    prisma.companyMessage.create({
      data: { threadId, sender: "NEVALO", content },
    }),
    prisma.companyMessage.updateMany({
      where: { threadId, sender: "COMPANY", readAt: null },
      data: { readAt: new Date() },
    }),
    prisma.notification.create({
      data: {
        companyId: thread.companyId,
        type: "SYSTEM",
        title: "Nouveau message de NEVALO",
        message: "L'équipe NEVALO a répondu à votre requête.",
        link: `/mon-espace/entreprise/messages/${threadId}`,
      },
    }),
  ]);

  revalidatePath(`/admin/requetes/${threadId}`);
  revalidatePath("/admin/requetes");
  redirect(`/admin/requetes/${threadId}`);
}
