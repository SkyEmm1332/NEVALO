const COLORS = [
  "bg-accent",
  "bg-blue",
  "bg-coral",
  "bg-teal",
  "bg-gold",
  "bg-accent-deep",
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

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
}: {
  name: string;
  size?: string;
}) {
  const color = COLORS[hash(name) % COLORS.length];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md font-extrabold text-white ${color} ${size}`}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
