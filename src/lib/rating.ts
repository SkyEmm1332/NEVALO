import type { Criterion } from "@prisma/client";

export const CRITERIA: { key: Criterion; label: string; weight: number }[] = [
  { key: "AMBIANCE", label: "Ambiance et relations", weight: 20 },
  { key: "MANAGEMENT", label: "Management", weight: 15 },
  { key: "REMUNERATION", label: "Rémunération", weight: 15 },
  { key: "EVOLUTION", label: "Évolution professionnelle", weight: 15 },
  { key: "WORKLOAD", label: "Charge de travail", weight: 10 },
  { key: "WORK_LIFE_BALANCE", label: "Équilibre vie pro / perso", weight: 10 },
  { key: "RECOGNITION", label: "Reconnaissance", weight: 5 },
  { key: "WORK_CONDITIONS", label: "Conditions de travail", weight: 5 },
  { key: "STABILITY", label: "Stabilité professionnelle", weight: 5 },
];

export function criterionLabel(key: Criterion): string {
  return CRITERIA.find((c) => c.key === key)?.label ?? key;
}

/**
 * Calcule l'indice global sur 100 à partir des notes individuelles par critère
 * (moyenne par critère, puis somme pondérée). Retourne null si aucune note.
 */
export function computeGlobalScore(
  ratings: { criterion: Criterion; score: number }[],
): number | null {
  if (ratings.length === 0) return null;

  const byCriterion = new Map<Criterion, number[]>();
  for (const r of ratings) {
    const list = byCriterion.get(r.criterion) ?? [];
    list.push(r.score);
    byCriterion.set(r.criterion, list);
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const { key, weight } of CRITERIA) {
    const scores = byCriterion.get(key);
    if (!scores || scores.length === 0) continue;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    weightedSum += avg * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;

  // Notes sur 5 -> ramenées sur 100 (facteur 20)
  return Math.round((weightedSum / totalWeight) * 20);
}

export const MIN_SCORE_FOR_RANKING = 10;

export function scoreToStars(score: number): number {
  return Math.max(1, Math.min(5, Math.round(score / 20)));
}

export function scoreToFloatStars(score: number): number {
  return Math.max(1, Math.min(5, score / 20));
}
