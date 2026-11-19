import Image from "next/image";

export function CompanyVerifiedBadge({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <Image
      src="/images/verifie.png"
      alt="Entreprise vérifiée par NEVALO"
      width={16}
      height={16}
      className={`shrink-0 ${className}`}
    />
  );
}
