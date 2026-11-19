import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "REPRESENTATIVE") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  });

  if (!account?.companyId) {
    return NextResponse.json({ unread: 0, items: [] });
  }

  const [unread, items] = await Promise.all([
    prisma.notification.count({
      where: { companyId: account.companyId, readAt: null },
    }),
    prisma.notification.findMany({
      where: { companyId: account.companyId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        link: true,
        readAt: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    unread,
    items: items.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      message: item.message,
      link: item.link,
      readAt: item.readAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}
