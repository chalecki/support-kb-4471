<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, type Cause, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { mergedInto, sharedSubjects, taggedWrong } from '#lib/kb/problems';

  let { ticket, repo, tickets }: { ticket: number; repo: string; tickets: Partial<Record<Cause, number>> } = $props();

  const raw = $derived(reports as Report[]);
  const merged = $derived(mergedInto(raw, ticket));
  const groups = $derived(groupByCause(merged, tenantOf));
  const link = (cause: string) => tickets[cause as Cause];
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.cause)}
      <tr>
        <td><code>{g.cause}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if link(g.cause)}
            <a href="https://github.com/{repo}/issues/{link(g.cause)}">{repo}#{link(g.cause)}</a>
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
  {#each groups as g (g.cause)}
    {#if readAs(g, notes.oneDayMove)}
      <li>{readAs(g, notes.oneDayMove)} of the <code>{g.cause}</code> reports read as a one-day move. They stay under <code>{g.cause}</code> by tenant.</li>
    {/if}
  {/each}
</ul>

<style>
  .sum { font-size: 1.1rem; }
  .checks { color: var(--muted); font-size: 0.9em; }
</style>
