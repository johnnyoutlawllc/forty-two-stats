'use client';
import { Card, TeamLabel, Pill } from '../ui';
import { fmtDate } from '@/lib/utils';
import type { Match } from '@/lib/types';

export function MatchesView({ matches, onNav }: { matches: Match[]; onNav: (n: string, p?: string) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <header>
        <h1 style={{ fontSize:22, fontWeight:600, margin:0 }}>Matches</h1>
        <p style={{ margin:'2px 0 0', color:'var(--text-2)', fontSize:13 }}>{matches.length} matches · click any to see game-by-game.</p>
      </header>
      <Card padded={false}>
        {matches.map((m, i) => {
          const t1Won = m.team1_games_won > m.team2_games_won;
          return (
            <div key={m.id} style={{ display:'grid', gridTemplateColumns:'90px 1fr 1fr 110px 90px', alignItems:'center', gap:12, padding:'14px 18px', borderTop: i ? '1px solid var(--border)' : 'none', fontSize:13, cursor:'pointer' }} onClick={() => onNav('match', m.id)}>
              <span style={{ color:'var(--text-2)' }}>{fmtDate(m.played_on)}</span>
              <TeamLabel a={{ name:m.t1a_name, color:m.t1a_color }} b={{ name:m.t1b_name, color:m.t1b_color }} size="sm" />
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:'var(--text-3)', fontSize:11 }}>vs</span>
                <TeamLabel a={{ name:m.t2a_name, color:m.t2a_color }} b={{ name:m.t2b_name, color:m.t2b_color }} size="sm" />
              </div>
              <span style={{ fontFamily:'monospace', color:'var(--text-2)' }}>{m.team1_games_won + m.team2_games_won} games</span>
              <span style={{ textAlign:'right' }}>
                <Pill tone="good" size="sm">{t1Won ? m.team1_games_won : m.team2_games_won}–{t1Won ? m.team2_games_won : m.team1_games_won}</Pill>
              </span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
