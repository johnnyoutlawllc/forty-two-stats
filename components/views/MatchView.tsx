'use client';
import { useState, useEffect } from 'react';
import { Card, TeamLabel, Pill, Btn, Avatar } from '../ui';
import { fmtDateLong } from '@/lib/utils';
import { getMatch } from '@/lib/data';
import type { Match, Game, Bid } from '@/lib/types';

export function MatchView({ matchId, onNav }: { matchId: string; onNav: (n: string, p?: string) => void }) {
  const [data, setData] = useState<{ match: Match; games: Game[]; bids: any[] } | null>(null);
  useEffect(() => { getMatch(matchId).then(setData).catch(console.error); }, [matchId]);
  if (!data) return <div style={{ color:'var(--text-2)', fontSize:13 }}>Loading…</div>;
  const { match: m, games, bids } = data;
  const t1Won = m.team1_games_won > m.team2_games_won;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <Btn kind="bare" onClick={() => onNav('matches')} icon="←">Matches</Btn>
      <header style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
        <div style={{ fontSize:12, color:'var(--text-2)', letterSpacing:'0.05em', textTransform:'uppercase' }}>{fmtDateLong(m.played_on)}</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:24, alignItems:'center', marginTop:12 }}>
          <TeamLabel a={{ name:m.t1a_name, color:m.t1a_color }} b={{ name:m.t1b_name, color:m.t1b_color }} size="lg" />
          <div style={{ fontSize:40, fontFamily:'monospace', fontWeight:600, letterSpacing:'-0.02em', textAlign:'center' }}>
            {m.team1_games_won} <span style={{ color:'var(--text-3)' }}>—</span> {m.team2_games_won}
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <TeamLabel a={{ name:m.t2a_name, color:m.t2a_color }} b={{ name:m.t2b_name, color:m.t2b_color }} size="lg" />
          </div>
        </div>
      </header>
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:16 }}>
        <Card title={`Games (${games.length} played)`} padded={false}>
          {games.map((g, i) => (
            <div key={g.id} style={{ display:'grid', gridTemplateColumns:'60px 1fr 1fr', alignItems:'center', padding:'12px 18px', borderTop: i ? '1px solid var(--border)' : 'none', fontSize:13 }}>
              <span style={{ color:'var(--text-2)' }}>Game {g.ordinal}</span>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span>{m.t1a_name}/{m.t1b_name}</span>
                <span style={{ fontFamily:'monospace', fontWeight: g.team1_pts > g.team2_pts ? 600 : 400, color: g.team1_pts > g.team2_pts ? 'var(--text)' : 'var(--text-2)' }}>{g.team1_pts}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingLeft:18 }}>
                <span>{m.t2a_name}/{m.t2b_name}</span>
                <span style={{ fontFamily:'monospace', fontWeight: g.team2_pts > g.team1_pts ? 600 : 400, color: g.team2_pts > g.team1_pts ? 'var(--text)' : 'var(--text-2)' }}>{g.team2_pts}</span>
              </div>
            </div>
          ))}
        </Card>
        <Card title="Bids called" padded={false}>
          {bids.length === 0 && <div style={{ padding:20, color:'var(--text-2)', fontSize:13, textAlign:'center' }}>No bids logged.</div>}
          {bids.map((b, i) => (
            <div key={b.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 18px', borderTop: i ? '1px solid var(--border)' : 'none', fontSize:13 }}>
              <Avatar name={b.bidder_name} color={b.bidder_color || '#888'} size="sm" />
              <span style={{ flex:1, fontWeight:500 }}>{b.bidder_name}</span>
              <span style={{ fontFamily:'monospace', color:'var(--text-2)' }}>bid {b.bid_value}</span>
              <Pill tone={b.made ? 'good' : 'bad'} size="sm">{b.made ? 'made' : 'set'}</Pill>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
