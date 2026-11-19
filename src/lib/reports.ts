export const REPORT_REASONS = [
  "Contenu haineux ou discriminatoire",
  "Données personnelles",
  "Diffamation ou information fausse",
  "Spam ou publicité",
  "Avis sans lien avec une expérience réelle",
  "Autre",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_OTHER_REASON: ReportReason = "Autre";

export const REPORT_DETAILS_MAX_LENGTH = 2000;

export function isReportReason(value: unknown): value is ReportReason {
  return (
    typeof value === "string" &&
    (REPORT_REASONS as readonly string[]).includes(value)
  );
}
