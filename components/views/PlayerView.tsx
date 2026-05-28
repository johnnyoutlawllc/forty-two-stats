'use client';
import { Card, Avatar, StatTile, Sparkline, SplitBar, FormDots, Pill, Btn } from '../ui';
import { fmtPct, fmtMarg, fmtDate, recentForm, winPctTimeline, rankPlayers } from '@/lib/utils';
import { h2hData } from '@/lib/utils';
import type { PlayerStats, Match, TeamStat } from '@/lib/types';

export function PlayerView({ playerId, players, matches, teams, onNav }: { playerId: string; players: PlayerStats[]; matches: Match[]; teams: TeamStat[]; onNav: (n: string, p?: string) => void }) {
  const p = players.find(x => x.id === playerId);
  if (!p) return <div style={{ color:'var(--text-2)' }}>Player not found.</div>;
  const games = p.wins + p.losses;
  const pct = p.wins / (games || 1);
  const form = recentForm(matches, p.id);
  const timeline = winPctTimeline(matches, p.id);
  const tlData = timeline.map(x => x.pct);
  const ranked = rankPlayers(players);
  const rank = ranked.findIndex(x => x.id === p.id) + 1;
  const playerMap = Object.fromEntries(players.map(x => [x.id, x]));

  // partner stats from team_stats
  const partners = teams.filter(t => t.p_lo === p.id || t.p_hi === p.id).map(t => ({
    ...t, partnerId: t.p_lo === p.id ? t.p_hi : t.p_lo,
    partnerName: t.p_lo === p.id ? t.player_b_name : t.player_a_name,
    partnerColor: t.p_lo === p.id ? t.player_b_color : t.player_a_color,
    myWins: t.wins, myLosses: t.losses,
  })).sort((a, b) => (b.wins / (b.wins + b.losses || 1)) - (a.wins / (a.wins + a.losses || 1)));

  // opponent record
  const oppMap: Record<string, { id: string; wins: number; losses: number; name: string; color: string }> = {};
  for (const m of matches) {
    const onT1 = m.team1_player_a === p.id || m.team1_player_b === p.id;
    const onT2 = m.team2_player_a === p.id || m.team2_player_b === p.id;
    if (!onT1 && !onT2) continue;
    const oppIds = onT1 ? [m.team2_player_a, m.team2_player_b] : [m.team1_player_a, m.team1_player_b];
    const won = (onT1 && m.team1_games_won > m.team2_games_won) || (onT2 && m.team2_games_won > m.team1_games_won);
    for (const oid of oppIds) {
      const op = playerMap[oid];
      if (!oppMap[oid]) oppMap[oid] = { id: oid, wins: 0, losses: 0, name: op?.name ?? oid, color: op?.color ?? '#888' };
      if (won) oppMap[oid].wins++; else oppMap[oid].losses++;
    }
  }
  const opponents = Object.values(oppMap).sort((a, b) => (b.wins/(b.wins+b.losses||1)) - (a.wins/(a.wins+a.losses||1)));
  const recentMatches = matches.filter(m => m.team1_player_a === p.id || m.team1_player_b === p.id || m.team2_player_a === p.id || m.team2_player_b === p.id).slice(0, 8);

  if (games === 0) return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <Btn kind="bare" onClick={() => onNav('standings')} icon="←">Standings</Btn>
      <header style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24, display:'flex', alignItems:'center', gap:20 }}>
        <Avatar name={p.name} color={p.color} size="xl" />
        <div><h1 style={{ margin:0, fontSize:26, fontWeight:600 }}>{p.name}</h1></div>
      </header>
      <Card><div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'32px 16px', textAlign:'center' }}>
        <div style={{ width:56, height:56, borderRadius:16, background:'var(--surface-2)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>◫</div>
        <div style={{ fontSize:16, fontWeight:600 }}>No matches yet</div>
        <div style={{ fontSize:13, color:'var(--text-2)', maxWidth:320 }}>Stats will show here once {p.name} plays their first match.</div>
        <Btn kind="primary" onClick={() => onNav('matches')}>Record a match</Btn>
      </div></Card>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <Btn kind="bare" onClick={() => onNav('standings')} icon="←" style={{ alignSelf:'flex-start' }}>Standings</Btn>
      <header style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24, display:'flex', alignItems:'center', gap:20 }}>
        <Avatar name={p.name} color={p.color} size="xl" />
        <div style={{ flex:1 }}>
          <h1 style={{ margin:0, fontSize:28, fontWeight:600, letterSpacing:'-0.01em' }}>{p.name}</h1>
          <div style={{ display:'flex', gap:14, marginTop:6, color:'var(--text-2)', fontSize:13, alignItems:'center', flexWrap:'wrap' }}>
            <span>{games} matches played</span><span>·</span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>form <FormDots form={form} /></span>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-2)' }}>Rank</div>
          <div style={{ fontSize:36, fontWeight:600, fontFamily:'monospace', lineHeight:1 }}>#{rank}</div>
        </div>
      </header>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <StatTile label="Win–loss" value={`${p.wins}–${p.losses}`} hint={`${games} matches`} />
        <StatTile label="Win pct" value={fmtPct(p.wins, p.losses)} hint={pct >= 0.5 ? 'above .500' : 'below .500'} tone={pct >= 0.5 ? 'accent' : undefined} />
        <StatTile label="Avg. margin" value={fmtMarg(p.avg_margin)} hint="games per match" />
        <StatTile label="Bid win %" value="—" hint="coming soon" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:16, alignItems:'start' }}>
        <Card title="Win % over time" padded>
          {tlData.length > 1 ? (
            <div>
              <Sparkline data={tlData} width={500} height={100} color="var(--accent)" filled />
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:11, color:'var(--text-2)' }}>
                <span>{fmtDate(timeline[0].date)}</span>
                <span style={{ fontFamily:'monospace' }}>final: {tlData[tlData.length-1].toFixed(3).replace(/^0/,'')}</span>
                <span>{fmtDate(timeline[timeline.length-1].date)}</span>
              </div>
            </div>
          ) : <div style={{ color:'var(--text-2)', fontSize:13 }}>Not enough matches yet.</div>}
        </Card>
        <Card title="Best partners" padded={false}>
          {partners.slice(0, 5).map(t => (
            <div key={t.partnerId} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderTop:'1px solid var(--border)', fontSize:13 }}>
              <Avatar name={t.partnerName} color={t.partnerColor} size="sm" />
              <span style={{ flex:1 }}>with {t.partnerName}</span>
              <span style={{ fontFamily:'monospace', color:'var(--text-2)' }}>{t.myWins}–{t.myLosses}</span>
              <span style={{ fontFamily:'monospace', width:50, textAlign:'right', fontWeight:500 }}>{fmtPct(t.myWins, t.myLosses)}</span>
            </div>
          ))}
        </Card>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'start' }}>
        <Card title="Vs. everybody" padded={false}>
          {opponents.map(o => (
            <div key={o.id} onClick={() => onNav('h2h', `${p.id}|${o.id}`)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderTop:'1px solid var(--border)', fontSize:13, cursor:'pointer' }}>
              <Avatar name={o.name} color={o.color} size="sm" />
              <span style={{ flex:1 }}>vs {o.name}</span>
              <div style={{ width:100 }}><SplitBar left={o.wins} right={o.losses} /></div>
              <span style={{ fontFamily:'monospace', color:'var(--text-2)', width:50, textAlign:'right' }}>{o.wins}–{o.losses}</span>
            </div>
          ))}
        </Card>
        <Card title="Recent matches" padded={false}>
          {recentMatches.map(m => {
            const onT1 = m.team1_player_a === p.id || m.team1_player_b === p.id;
            const won = (onT1 && m.team1_games_won > m.team2_games_won) || (!onT1 && m.team2_games_won > m.team1_games_won);
            const partnerId = onT1 ? (m.team1_player_a === p.id ? m.team1_player_b : m.team1_player_a) : (m.team2_player_a === p.id ? m.team2_player_b : m.team2_player_a);
            const partnerName = playerMap[partnerId]?.name ?? '';
            const oppT = onT1 ? `${m.t2a_name[0]}/${m.t2b_name[0]}` : `${m.t1a_name[0]}/${m.t1b_name[0]}`;
            return (
              <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderTop:'1px solid var(--border)', fontSize:13 }}>
                <span style={{ width:60, color:'var(--text-2)' }}>{fmtDate(m.played_on)}</span>
                <Pill tone={won ? 'good' : 'bad'} size="sm">{won ? 'W' : 'L'}</Pill>
                <span style={{ color:'var(--text-2)', fontSize:12 }}>w/ {partnerName}</span>
                <span style={{ flex:1, color:'var(--text-3)', fontSize:12 }}>vs {oppT}</span>
                <span style={{ fontFamily:'monospace' }}>{won ? (onT1 ? m.team1_games_won : m.team2_games_won) : (onT1 ? m.team1_games_won : m.team2_games_won)}–{won ? (onT1 ? m.team2_games_won : m.team1_games_won) : (onT1 ? m.team2_games_won : m.team1_games_won)}</span>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
