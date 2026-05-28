import type { Match, PlayerStats } from './types';

export function fmtPct(w: number, l: number): string {
  const t = w + l;
  if (!t) return '—';
  return (w / t).toFixed(3).replace(/^0/, '');
}

export function fmtMarg(m: number | null | undefined): string {
  if (m == null) return '—';
  if (m === 0) return '0.00';
  return (m > 0 ? '+' : '') + Number(m).toFixed(2);
}

export function fmtDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function fmtDateLong(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function initials(name: string): string {
  return name.slice(0, name.length > 4 ? 1 : 2).toUpperCase();
}

export function recentForm(matches: Match[], playerId: string, n = 5): ('W' | 'L')[] {
  const out: ('W' | 'L')[] = [];
  for (const m of matches) {
    const onT1 = m.team1_player_a === playerId || m.team1_player_b === playerId;
    const onT2 = m.team2_player_a === playerId || m.team2_player_b === playerId;
    if (!onT1 && !onT2) continue;
    const won = onT1 ? m.team1_games_won > m.team2_games_won : m.team2_games_won > m.team1_games_won;
    out.push(won ? 'W' : 'L');
    if (out.length >= n) break;
  }
  return out;
}

export function winPctTimeline(matches: Match[], playerId: string) {
  let w = 0, t = 0;
  const pts: { date: string; pct: number }[] = [];
  const sorted = [...matches].sort((a, b) => a.played_on.localeCompare(b.played_on));
  for (const m of sorted) {
    const onT1 = m.team1_player_a === playerId || m.team1_player_b === playerId;
    const onT2 = m.team2_player_a === playerId || m.team2_player_b === playerId;
    if (!onT1 && !onT2) continue;
    t++;
    if ((onT1 && m.team1_games_won > m.team2_games_won) || (onT2 && m.team2_games_won > m.team1_games_won)) w++;
    pts.push({ date: m.played_on, pct: w / t });
  }
  return pts;
}

export function gamesByMonth(matches: Match[]): [string, number][] {
  const buckets: Record<string, number> = {};
  for (const m of matches) {
    const k = m.played_on.slice(0, 7);
    buckets[k] = (buckets[k] || 0) + 1;
  }
  return Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0]));
}

export function h2hData(matches: Match[], idA: string, idB: string) {
  let aw = 0, bw = 0, gA = 0, gB = 0;
  const h2hMatches: Match[] = [];
  for (const m of matches) {
    const t1 = [m.team1_player_a, m.team1_player_b];
    const t2 = [m.team2_player_a, m.team2_player_b];
    const aIn1 = t1.includes(idA), bIn1 = t1.includes(idB);
    const aIn2 = t2.includes(idA), bIn2 = t2.includes(idB);
    if (!((aIn1 && bIn2) || (aIn2 && bIn1))) continue;
    if (aIn1) {
      aw += m.team1_games_won; bw += m.team2_games_won;
      gA += m.team1_games_won; gB += m.team2_games_won;
    } else {
      aw += m.team2_games_won; bw += m.team1_games_won;
      gA += m.team2_games_won; gB += m.team1_games_won;
    }
    h2hMatches.push(m);
  }
  return { aw, bw, gA, gB, matches: h2hMatches };
}

export function rankPlayers(players: PlayerStats[]): PlayerStats[] {
  return [...players].sort((a, b) => {
    const pa = a.wins / (a.wins + a.losses || 1);
    const pb = b.wins / (b.wins + b.losses || 1);
    return pb - pa;
  });
}
