'use client';
import { useState, useEffect, useCallback } from 'react';
import { Shell } from './Shell';
import { HomeView } from './views/HomeView';
import { StandingsView } from './views/StandingsView';
import { MatchesView } from './views/MatchesView';
import { MatchView } from './views/MatchView';
import { PlayerView } from './views/PlayerView';
import { H2HView } from './views/H2HView';
import { RecordModal } from './RecordModal';
import { getPlayerStats, getMatches, getTeamStats } from '@/lib/data';
import type { Route, PlayerStats, Match, TeamStat } from '@/lib/types';

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<TeamStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordOpen, setRecordOpen] = useState(false);

  const refresh = useCallback(() => {
    Promise.all([getPlayerStats(), getMatches(), getTeamStats()])
      .then(([p, m, t]) => { setPlayers(p); setMatches(m); setTeams(t); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const nav = (name: string, param?: string) => {
    if (name === 'player' && param)     setRoute({ name: 'player', playerId: param });
    else if (name === 'match' && param) setRoute({ name: 'match', matchId: param });
    else if (name === 'h2h') {
      if (param) { const [a, b] = param.split('|'); setRoute({ name: 'h2h', a, b }); }
      else setRoute({ name: 'h2h' });
    }
    else if (name === 'home')      setRoute({ name: 'home' });
    else if (name === 'standings') setRoute({ name: 'standings' });
    else if (name === 'matches')   setRoute({ name: 'matches' });
    else if (name === 'settings')  setRoute({ name: 'settings' });
    window.scrollTo(0, 0);
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', color:'var(--text-2)', fontSize:14 }}>
      Loading…
    </div>
  );

  const view = () => {
    switch (route.name) {
      case 'home':      return <HomeView players={players} matches={matches} teams={teams} onNav={nav} />;
      case 'standings': return <StandingsView players={players} teams={teams} matches={matches} onNav={nav} />;
      case 'matches':   return <MatchesView matches={matches} onNav={nav} />;
      case 'match':     return <MatchView matchId={route.matchId} onNav={nav} />;
      case 'player':    return <PlayerView playerId={route.playerId} players={players} matches={matches} teams={teams} onNav={nav} />;
      case 'h2h':       return <H2HView initial={{ a: route.a, b: route.b }} players={players} matches={matches} onNav={nav} />;
      case 'settings':  return <div style={{ color:'var(--text-2)', padding:24 }}>Players admin — coming soon.</div>;
      default:          return null;
    }
  };

  return (
    <>
      <Shell route={route} nav={nav} onRecord={() => setRecordOpen(true)} players={players}>
        {view()}
      </Shell>
      <RecordModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        players={players}
        onSaved={() => { setRecordOpen(false); refresh(); nav('matches'); }}
      />
    </>
  );
}
