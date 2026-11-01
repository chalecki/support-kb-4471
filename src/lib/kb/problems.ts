// What the reports in a ticket say went wrong, on top of where causes.ts files them.
// causeOf() looks only at tenant and channel, so a report whose body describes a different failure
// still lands in `parser`. desk-notes.json names those reports: they get their own problem here.
import { groupByCause, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem };

export function mergedInto(reports: Report[], ticket: number): Report[] {
  return uniqueById(reports).filter((r) => r.mergedInto === ticket);
}

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const moved = reports.filter((r) => oneDayMove.includes(r.id));
  const rest = reports.filter((r) => !oneDayMove.includes(r.id));
  const rows = groupByCause(rest, tenantOf).map(({ cause, ...g }) => ({ ...g, problem: cause as Problem }));
  const [one] = groupByCause(moved, tenantOf);
  return one ? [...rows, { ...one, problem: 'one-day' as const }] : rows;
}

// Reports that sit in one problem while intake tagged them as another.
export function taggedWrong(groups: ProblemGroup[]): number {
  return groups
    .filter((g) => g.problem !== 'one-day')
    .reduce((n, g) => n + g.reports.filter((r) => r.meta.intakeTag !== g.problem).length, 0);
}

// Subject lines that appear in more than one problem: the rule in decision 0001 cannot split them.
export function sharedSubjects(groups: ProblemGroup[]): number {
  const seen = new Map<string, Set<Problem>>();
  for (const g of groups) {
    for (const r of g.reports) seen.set(r.subject, (seen.get(r.subject) ?? new Set()).add(g.problem));
  }
  return [...seen.values()].filter((s) => s.size > 1).length;
}
