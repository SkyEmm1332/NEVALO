import { companyTheme } from "@/lib/company-color";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CompanyAvatar({
  name,
  size = "h-11 w-11 text-sm",
  color,
  logoUrl,
  logoPosition,
}: {
  name: string;
  size?: string;
  color?: string;
  logoUrl?: string | null;
  logoPosition?: string | null;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        aria-hidden
        className={`shrink-0 rounded-md object-cover ${size}`}
        style={
          logoPosition ? { objectPosition: logoPosition } : undefined
        }
      />
    );
  }

  const colorClass = color ?? companyTheme(name).avatar;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md font-extrabold text-white ${colorClass} ${size}`}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
