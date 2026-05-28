'use client';
import { useState, useMemo } from 'react';
import { Card, Avatar, TeamLabel, FormDots, Th } from '../ui';
import { fmtPct, fmtMarg, recentForm } from '@/lib/utils';
import type { PlayerStats, TeamStat, Match } from '@/lib/types';

export function StandingsView({ players, teams, matches, onNav }: { players: PlayerStats[]; teams: TeamStat[]; matches: Match[]; onNav: (n: string, p?: string) => void }) {
  const [mode, setMode] = useState<'players'|'teams'>('players');
  const [sort, setSort] = useState<{key:string;dir:'asc'|'desc'}>({ key:'win_pct', dir:'desc' });
  const [minGames, setMinGames] = useState(0);

  const rows = useMemo(() => {
    if (mode === 'players') return players.filter(p => p.wins + p.losses >= minGames);
    return teams.filter(t => t.wins + t.losses >= minGames);
  }, [mode, minGames, players, teams]);

  const sorted = useMemo(() => {
    const dir = sort.dir === 'desc' ? -1 : 1;
    return [...rows].sort((a: any, b: any) => {
      const av = a[sort.key], bv = b[sort.key];
      if (typeof av === 'string') return av.localeCompare(bv) * dir;
      return ((Number(av) ?? 0) - (Number(bv) ?? 0)) * dir;
    });
  }, [rows, sort]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <header style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:600, margin:0 }}>Standings</h1>
          <p style={{ margin:'2px 0 0', color:'var(--text-2)', fontSize:13 }}>{matches.length} matches counted.</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ display:'inline-flex', border:'1px solid var(--border)', borderRadius:7, padding:2, background:'var(--surface)' }}>
            {(['players','teams'] as const).map(k => (
              <button key={k} onClick={() => setMode(k)} style={{ background: mode===k ? 'var(--text)' : 'transparent', color: mode===k ? 'var(--surface)' : 'var(--text-2)', border:'none', padding:'5px 12px', borderRadius:5, cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit', textTransform:'capitalize' }}>{k}</button>
            ))}
          </div>
          <label style={{ fontSize:12, color:'var(--text-2)', display:'flex', alignItems:'center', gap:6 }}>
            min games
            <select value={minGames} onChange={e => setMinGames(+e.target.value)} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'4px 6px', fontFamily:'inherit', fontSize:12, color:'var(--text)' }}>
              <option value="0">0</option><option value="5">5</option><option value="10">10</option><option value="25">25</option>
            </select>
          </label>
        </div>
      </header>
      <Card padded={false}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr>
              <Th>#</Th>
              <Th sortKey="name" sort={sort} setSort={setSort}>{mode === 'players' ? 'Player' : 'Team'}</Th>
              <Th sortKey="wins" sort={sort} setSort={setSort} align="right" width={60}>W</Th>
              <Th sortKey="losses" sort={sort} setSort={setSort} align="right" width={60}>L</Th>
              <Th sortKey="win_pct" sort={sort} setSort={setSort} align="right" width={80}>Pct</Th>
              <Th sortKey="avg_margin" sort={sort} setSort={setSort} align="right" width={90}>Avg. marg</Th>
              <Th sortKey={mode==='players' ? 'bid_win_pct' : 'score_42plus'} sort={sort} setSort={setSort} align="right" width={80}>{mode==='players' ? 'Bid %' : '42+'}</Th>
              <Th align="right" width={100}>Form</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r: any, i) => {
              const form = mode === 'players' ? recentForm(matches, r.id) : (() => {
                const out: ('W'|'L')[] = [];
                for (const m of matches) {
                  const t1 = [m.team1_player_a, m.team1_player_b];
                  const t2 = [m.team2_player_a, m.team2_player_b];
                  if (t1.includes(r.p_lo) && t1.includes(r.p_hi)) out.push(m.team1_games_won > m.team2_games_won ? 'W' : 'L');
                  else if (t2.includes(r.p_lo) && t2.includes(r.p_hi)) out.push(m.team2_games_won > m.team1_games_won ? 'W' : 'L');
                  if (out.length >= 5) break;
                }
                return out;
              })();
              return (
                <tr key={r.id ?? `${r.p_lo}-${r.p_hi}`} onClick={() => mode==='players' ? onNav('player', r.id) : null} style={{ borderTop:'1px solid var(--border)', cursor: mode==='players' ? 'pointer' : 'default' }}>
                  <td style={{ padding:'11px 12px', color:'var(--text-2)', fontFamily:'monospace', fontSize:12, width:36 }}>{i+1}</td>
                  <td style={{ padding:'11px 12px' }}>
                    {mode === 'players'
                      ? <span style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
                          <Avatar name={r.name} color={r.color} size="md" />
                          <span style={{ fontWeight:500 }}>{r.name}</span>
                        </span>
                      : <TeamLabel a={{ name:r.player_a_name, color:r.player_a_color }} b={{ name:r.player_b_name, color:r.player_b_color }} size="md" />
                    }
                  </td>
                  <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:'monospace' }}>{r.wins}</td>
                  <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:'monospace', color:'var(--text-2)' }}>{r.losses}</td>
                  <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:'monospace', fontWeight:500 }}>{fmtPct(r.wins, r.losses)}</td>
                  <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:'monospace', color: Number(r.avg_margin)>0 ? 'var(--good)' : Number(r.avg_margin)<0 ? 'var(--bad)' : 'var(--text-2)' }}>{fmtMarg(r.avg_margin)}</td>
                  <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:'monospace' }}>
                    {mode === 'players'
                      ? (r.bid_win_pct != null ? Number(r.bid_win_pct).toFixed(3).replace(/^0/,'') : <span style={{ color:'var(--text-3)' }}>—</span>)
                      : (Number(r.score_42plus) > 0 ? '+' : '') + Number(r.score_42plus).toFixed(1)
                    }
                  </td>
                  <td style={{ padding:'11px 12px', textAlign:'right' }}>
                    {form.length ? <FormDots form={form} /> : <span style={{ color:'var(--text-3)', fontSize:11 }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
