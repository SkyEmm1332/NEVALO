import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompanyFicheForm } from "@/components/CompanyFicheForm";

export default async function CompanyFicheSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/mon-espace/entreprise/parametres");
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

  const company = await prisma.company.findUnique({
    where: { id: account.companyId },
  });

  if (!company) {
    redirect("/mon-espace/entreprise");
  }

  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <header className="border-b border-line pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Modifier ma fiche
        </h1>
        <p className="mt-1 text-sm text-soft">
          Mettez à jour les informations de votre bannière, votre logo et votre
          image de couverture.
        </p>
      </header>

      {params.updated ? (
        <p className="mt-6 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
          Votre fiche a été mise à jour.
        </p>
      ) : null}
      {params.error === "name" ? (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          Le nom de l&apos;entreprise est requis.
        </p>
      ) : null}
      {params.error === "upload" ? (
        <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          Image invalide : utilisez un fichier PNG, JPG ou WebP de moins de 5
          Mo.
        </p>
      ) : null}

      <CompanyFicheForm
        company={{
          id: company.id,
          name: company.name,
          description: company.description,
          website: company.website,
          email: company.email,
          phone: company.phone,
          address: company.address,
          city: company.city,
          sector: company.sector,
          size: company.size,
          coverKey: company.coverKey,
          coverUrl: company.coverUrl,
          logoUrl: company.logoUrl,
          logoPosition: company.logoPosition,
          bannerPosition: company.bannerPosition,
        }}
      />
    </div>
  );
}
