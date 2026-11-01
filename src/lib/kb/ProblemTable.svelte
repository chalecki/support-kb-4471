<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, mergedInto, sharedSubjects, taggedWrong, type Problem } from '#lib/kb/problems';

  let { ticket, repo, tickets }: { ticket: number; repo: string; tickets: Partial<Record<Problem, number>> } = $props();

  const raw = $derived(reports as Report[]);
  const merged = $derived(mergedInto(raw, ticket));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
  const total = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
</script>

<p class="sum">
  <strong>{total}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if tickets[g.problem]}
            <a href="https://github.com/{repo}/issues/{tickets[g.problem]}">{repo}#{tickets[g.problem]}</a>
          {:else}
            none
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<ul class="checks">
  <li>The export holds {raw.length} rows. {raw.length - merged.length} repeat an id from an overlapping page, so they count once.</li>
  <li>Intake's tag disagrees with the tenant lookup on {taggedWrong(groups)} reports. These counts use the lookup.</li>
  <li>{sharedSubjects(groups)} subject lines appear under more than one problem.</li>
</ul>

<style>
  .sum { font-size: 1.1rem; }
  .checks { color: var(--muted); font-size: 0.9em; }
</style>
