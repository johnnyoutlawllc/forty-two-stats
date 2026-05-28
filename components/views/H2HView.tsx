'use client';
import { useState } from 'react';
import { Card, Avatar, StatTile, SplitBar, TeamLabel, Pill } from '../ui';
import { fmtPct, fmtMarg, fmtDate, h2hData } from '@/lib/utils';
import type { PlayerStats, Match } from '@/lib/types';

export function H2HView({ initial, players, matches, onNav }: { initial?: { a?: string; b?: string }; players: PlayerStats[]; matches: Match[]; onNav: (n: string, p?: string) => void }) {
  const [a, setA] = useState(initial?.a ?? players[0]?.id ?? '');
  const [b, setB] = useState(initial?.b ?? players[1]?.id ?? '');
  const h = h2hData(matches, a, b);
  const pA = players.find(p => p.id === a);
  const pB = players.find(p => p.id === b);
  const totalGames = h.aw + h.bw;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <header>
        <h1 style={{ fontSize:22, fontWeight:600, margin:0 }}>Head to head</h1>
        <p style={{ margin:'2px 0 0', color:'var(--text-2)', fontSize:13 }}>Pick two players on opposite teams.</p>
      </header>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <PlayerSelect value={a} onChange={setA} players={players} />
        <span style={{ color:'var(--text-3)', fontSize:13 }}>vs.</span>
        <PlayerSelect value={b} onChange={setB} players={players} />
      </div>
      <Card padded>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:20, alignItems:'center' }}>
          {pA && <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Avatar name={pA.name} color={pA.color} size="lg" />
            <div><div style={{ fontSize:18, fontWeight:600 }}>{pA.name}</div><div style={{ fontSize:12, color:'var(--text-2)' }}>{pA.wins}–{pA.losses} all-time</div></div>
          </div>}
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:36, fontWeight:600, fontFamily:'monospace', letterSpacing:'-0.02em' }}>{h.aw} <span style={{ color:'var(--text-3)' }}>—</span> {h.bw}</div>
            <div style={{ fontSize:11, color:'var(--text-2)', letterSpacing:'0.05em', textTransform:'uppercase' }}>series · {h.matches.length} matches</div>
          </div>
          {pB && <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'flex-end' }}>
            <div style={{ textAlign:'right' }}><div style={{ fontSize:18, fontWeight:600 }}>{pB.name}</div><div style={{ fontSize:12, color:'var(--text-2)' }}>{pB.wins}–{pB.losses} all-time</div></div>
            <Avatar name={pB.name} color={pB.color} size="lg" />
          </div>}
        </div>
        {totalGames > 0 && (
          <div style={{ marginTop:18 }}>
            <SplitBar left={h.aw} right={h.bw} height={10} />
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:11, color:'var(--text-2)' }}>
              <span style={{ fontFamily:'monospace' }}>{pA ? (h.aw/totalGames*100).toFixed(0) : 0}% to {pA?.name}</span>
              <span style={{ fontFamily:'monospace' }}>{pB ? (h.bw/totalGames*100).toFixed(0) : 0}% to {pB?.name}</span>
            </div>
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:18 }}>
          <StatTile label="Series wins" value={`${h.aw} – ${h.bw}`} hint={`${h.matches.length} matches`} />
          <StatTile label="Avg series" value={h.matches.length ? `${(h.aw/h.matches.length).toFixed(1)}–${(h.bw/h.matches.length).toFixed(1)}` : '—'} hint="games per match" />
          <StatTile label={`${pA?.name ?? 'A'}'s edge`} value={fmtMarg(h.aw - h.bw)} hint="net series wins" />
        </div>
      </Card>
      <Card title="Matches" padded={false}>
        {h.matches.length === 0 && (
          <div style={{ padding:24, textAlign:'center', color:'var(--text-2)', fontSize:13 }}>
            {pA?.name} and {pB?.name} haven't squared off yet.
          </div>
        )}
        {h.matches.map(m => {
          const aOnT1 = m.team1_player_a === a || m.team1_player_b === a;
          const aWon = aOnT1 ? m.team1_games_won > m.team2_games_won : m.team2_games_won > m.team1_games_won;
          const aScore = aOnT1 ? m.team1_games_won : m.team2_games_won;
          const bScore = aOnT1 ? m.team2_games_won : m.team1_games_won;
          return (
            <div key={m.id} style={{ display:'grid', gridTemplateColumns:'80px 1fr 90px', alignItems:'center', gap:12, padding:'12px 18px', borderTop:'1px solid var(--border)', fontSize:13, cursor:'pointer' }} onClick={() => onNav('match', m.id)}>
              <span style={{ color:'var(--text-2)' }}>{fmtDate(m.played_on)}</span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <TeamLabel a={{ name:aOnT1 ? m.t1a_name : m.t2a_name, color:aOnT1 ? m.t1a_color : m.t2a_color }} b={{ name:aOnT1 ? m.t1b_name : m.t2b_name, color:aOnT1 ? m.t1b_color : m.t2b_color }} size="sm" />
                <span style={{ color:'var(--text-3)', fontSize:11 }}>vs</span>
                <TeamLabel a={{ name:aOnT1 ? m.t2a_name : m.t1a_name, color:aOnT1 ? m.t2a_color : m.t1a_color }} b={{ name:aOnT1 ? m.t2b_name : m.t1b_name, color:aOnT1 ? m.t2b_color : m.t1b_color }} size="sm" />
              </div>
              <span style={{ textAlign:'right' }}><Pill tone={aWon ? 'good' : 'bad'} size="sm">{aScore}–{bScore}</Pill></span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function PlayerSelect({ value, onChange, players }: { value: string; onChange: (v: string) => void; players: PlayerStats[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', fontFamily:'inherit', fontSize:14, color:'var(--text)', minWidth:180, fontWeight:500 }}>
      {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}
