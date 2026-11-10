import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/ReviewForm";

export default async function DeposerAvisPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const companies = await prisma.company.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        Registre · Contribution
      </p>
      <h1 className="mt-2 text-4xl font-extrabold uppercase tracking-tight text-ink">
        Déposer un avis
      </h1>
      <p className="mt-2 text-sm text-muted">
        Partagez votre expérience professionnelle en toute transparence.
      </p>
      <div className="mt-8">
        <ReviewForm companies={companies} />
      </div>
    </div>
  );
}
