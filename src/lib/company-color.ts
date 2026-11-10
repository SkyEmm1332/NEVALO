export const COMPANY_THEMES = [
  {
    avatar: "bg-accent",
    top: "border-t-accent",
    divider: "border-l-accent/40",
    tint: "bg-accent/10",
    text: "text-accent",
    bar: "bg-accent",
  },
  {
    avatar: "bg-blue",
    top: "border-t-blue",
    divider: "border-l-blue/40",
    tint: "bg-blue/10",
    text: "text-blue",
    bar: "bg-blue",
  },
  {
    avatar: "bg-coral",
    top: "border-t-coral",
    divider: "border-l-coral/40",
    tint: "bg-coral/10",
    text: "text-coral",
    bar: "bg-coral",
  },
  {
    avatar: "bg-teal",
    top: "border-t-teal",
    divider: "border-l-teal/40",
    tint: "bg-teal/10",
    text: "text-teal",
    bar: "bg-teal",
  },
  {
    avatar: "bg-gold",
    top: "border-t-gold",
    divider: "border-l-gold/40",
    tint: "bg-gold/10",
    text: "text-gold",
    bar: "bg-gold",
  },
  {
    avatar: "bg-accent-deep",
    top: "border-t-accent-deep",
    divider: "border-l-accent-deep/40",
    tint: "bg-accent-deep/10",
    text: "text-accent-deep",
    bar: "bg-accent-deep",
  },
] as const;

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index++) {
    result = (result * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(result);
}

export function companyTheme(name: string) {
  return COMPANY_THEMES[hash(name) % COMPANY_THEMES.length];
}

export function distinctCompanyThemes(names: string[]) {
  const available = COMPANY_THEMES.filter(
    (theme) => theme.avatar !== "bg-gold",
  );
  const used = new Set<string>();
  return names.map((name) => {
    let theme = available[hash(name) % available.length];
    if (used.has(theme.avatar)) {
      theme =
        available.find((candidate) => !used.has(candidate.avatar)) ?? theme;
    }
    used.add(theme.avatar);
    return theme;
  });
}
