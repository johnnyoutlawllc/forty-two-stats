'use client';
import { Card, StatTile, Sparkline, TeamLabel, Pill, Btn } from '../ui';
import { fmtPct, fmtDate, gamesByMonth, rankPlayers } from '@/lib/utils';
import type { Match, PlayerStats, TeamStat } from '@/lib/types';

export function HomeView({ players, matches, teams, onNav }: { players: PlayerStats[]; matches: Match[]; teams: TeamStat[]; onNav: (n: string, p?: string) => void }) {
  const ranked = rankPlayers(players.filter(p => p.wins + p.losses >= 3));
  const leader = ranked[0];
  const hotTeam = [...teams].filter(t => t.wins + t.losses >= 3).sort((a, b) => Number(b.score_42plus) - Number(a.score_42plus))[0];
  const recent = matches.slice(0, 5);
  const months = gamesByMonth(matches);
  const sparkData = months.slice(-9).map(([, n]) => n);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <header>
        <h1 style={{ fontSize:26, fontWeight:600, margin:0, letterSpacing:'-0.01em' }}>42 Stats</h1>
        <p style={{ margin:'4px 0 0', color:'var(--text-2)', fontSize:14 }}>{matches.length} matches in the books.</p>
      </header>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {leader && <StatTile label="Leader" value={leader.name} hint={`${leader.wins}–${leader.losses} · ${fmtPct(leader.wins, leader.losses)}`} tone="accent" />}
        {hotTeam && <StatTile label="Hottest team" value={`${hotTeam.player_a_name[0]}/${hotTeam.player_b_name[0]}`} hint={`${hotTeam.wins}–${hotTeam.losses} · 42+ ${Number(hotTeam.score_42plus).toFixed(1)}`} />}
        <StatTile label="Matches logged" value={matches.length} hint={`${months[months.length-1]?.[1] ?? 0} this month`} />
        <StatTile label="Avg games/match" value={(matches.reduce((s, m) => s + m.team1_games_won + m.team2_games_won, 0) / (matches.length || 1)).toFixed(1)} hint="per match" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16, alignItems:'start' }}>
        <Card title="Recent matches" action={<Btn kind="bare" onClick={() => onNav('matches')}>View all →</Btn>} padded={false}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <tbody>
              {recent.map(m => {
                const t1Won = m.team1_games_won > m.team2_games_won;
                return (
                  <tr key={m.id} style={{ borderTop:'1px solid var(--border)', cursor:'pointer' }} onClick={() => onNav('match', m.id)}>
                    <td style={{ padding:'12px 16px', width:72, color:'var(--text-2)', whiteSpace:'nowrap' }}>{fmtDate(m.played_on)}</td>
                    <td style={{ padding:'12px 8px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <TeamLabel a={{ name:m.t1a_name, color:m.t1a_color }} b={{ name:m.t1b_name, color:m.t1b_color }} size="sm" />
                        <span style={{ color:'var(--text-3)', fontSize:11 }}>def.</span>
                        <TeamLabel a={{ name:m.t2a_name, color:m.t2a_color }} b={{ name:m.t2b_name, color:m.t2b_color }} size="sm" />
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', textAlign:'right', fontFamily:'monospace', whiteSpace:'nowrap' }}>
                      <Pill tone="good" size="sm">{t1Won ? m.team1_games_won : m.team2_games_won}–{t1Won ? m.team2_games_won : m.team1_games_won}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Card title="Activity" padded>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:8 }}>
              <div>
                <div style={{ fontSize:28, fontWeight:600, fontFamily:'monospace' }}>{matches.length}</div>
                <div style={{ fontSize:12, color:'var(--text-2)' }}>matches all-time</div>
              </div>
              <Sparkline data={sparkData} width={120} height={36} color="var(--accent)" filled />
            </div>
            <div style={{ display:'flex', gap:6, fontSize:10, color:'var(--text-3)', letterSpacing:'0.04em', textTransform:'uppercase' }}>
              <span>{months[Math.max(0, months.length-9)]?.[0]}</span>
              <span style={{ flex:1, textAlign:'right' }}>{months[months.length-1]?.[0]}</span>
            </div>
          </Card>
          <Card title="Standings — top 4" action={<Btn kind="bare" onClick={() => onNav('standings')}>All →</Btn>} padded={false}>
            {ranked.slice(0, 4).map((p, i) => (
              <div key={p.id} onClick={() => onNav('player', p.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderTop:'1px solid var(--border)', fontSize:13, cursor:'pointer' }}>
                <span style={{ width:14, color:'var(--text-2)', fontFamily:'monospace', fontSize:12 }}>{i+1}</span>
                <span style={{ width:22, height:22, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, flexShrink:0, background:`color-mix(in oklab, ${p.color} 22%, var(--surface))`, color:`color-mix(in oklab, ${p.color} 85%, var(--text))`, border:`1px solid color-mix(in oklab, ${p.color} 35%, var(--border))` }}>{p.name[0]}</span>
                <span style={{ flex:1, fontWeight:500 }}>{p.name}</span>
                <span style={{ fontFamily:'monospace', color:'var(--text-2)' }}>{p.wins}–{p.losses}</span>
                <span style={{ fontFamily:'monospace', width:42, textAlign:'right' }}>{fmtPct(p.wins, p.losses)}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
