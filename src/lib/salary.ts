import type { Prisma } from "@prisma/client";

export type SalaryStat = {
  jobTitle: string;
  period: string;
  isNet: boolean;
  currency: string;
  count: number;
  min: number;
  max: number;
  median: number;
};

type RawSalary = {
  jobTitle: string;
  amount: Prisma.Decimal | null;
  period: string;
  isNet: boolean;
  currency: string;
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function aggregateSalaries(reports: RawSalary[]): SalaryStat[] {
  const groups = new Map<string, number[]>();
  const refs = new Map<string, RawSalary>();

  for (const r of reports) {
    if (r.amount === null) continue;
    const n = r.amount.toNumber();
    if (n <= 0) continue;
    const key = `${r.jobTitle}::${r.period}::${r.isNet ? "net" : "brut"}`;
    const list = groups.get(key) ?? [];
    list.push(n);
    groups.set(key, list);
    refs.set(key, r);
  }

  const stats: SalaryStat[] = [];
  for (const [key, amounts] of groups.entries()) {
    const [jobTitle, period, netLabel] = key.split("::");
    const ref = refs.get(key);
    stats.push({
      jobTitle,
      period,
      isNet: netLabel === "net",
      currency: ref?.currency ?? "XOF",
      count: amounts.length,
      min: Math.min(...amounts),
      max: Math.max(...amounts),
      median: median(amounts),
    });
  }

  stats.sort((a, b) => a.jobTitle.localeCompare(b.jobTitle));
  return stats;
}

export function formatXOF(value: number): string {
  return `${Math.round(value).toLocaleString("fr-FR")} FCFA`;
}
