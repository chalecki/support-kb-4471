// Checks on the groups causes.ts makes for a ticket.
import { uniqueById, type CauseGroup, type Report } from '#lib/kb/causes';

export function mergedInto(reports: Report[], ticket: number): Report[] {
  return uniqueById(reports).filter((r) => r.mergedInto === ticket);
}

// Reports that sit in one cause while intake tagged them as another.
export function taggedWrong(groups: CauseGroup[]): number {
  return groups.reduce((n, g) => n + g.reports.filter((r) => r.meta.intakeTag !== g.cause).length, 0);
}

// Subject lines that appear under more than one cause: the rule in decision 0001 cannot split them.
export function sharedSubjects(groups: CauseGroup[]): number {
  const seen = new Map<string, Set<CauseGroup['cause']>>();
  for (const g of groups) {
    for (const r of g.reports) seen.set(r.subject, (seen.get(r.subject) ?? new Set()).add(g.cause));
  }
  return [...seen.values()].filter((s) => s.size > 1).length;
}
