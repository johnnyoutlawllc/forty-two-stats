'use client';
import { useState, useEffect, useCallback } from 'react';
import { Shell } from './Shell';
import { Landing } from './Landing';
import { ShareModal } from './ShareModal';
import { HomeView } from './views/HomeView';
import { StandingsView } from './views/StandingsView';
import { MatchesView } from './views/MatchesView';
import { MatchView } from './views/MatchView';
import { PlayerView } from './views/PlayerView';
import { H2HView } from './views/H2HView';
import { SettingsView } from './views/SettingsView';
import { RecordModal } from './RecordModal';
import { Btn } from './ui';
import { useAuth } from '@/lib/auth';
import { getMyLeagues, getDemoLeague, createLeague } from '@/lib/leagues';
import { getPlayerStats, getMatches, getTeamStats } from '@/lib/data';
import type { Route, PlayerStats, Match, TeamStat, League } from '@/lib/types';

const LAST_LEAGUE_KEY = 'ft42_last_league';

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();

  const [route, setRoute]       = useState<Route>({ name: 'home' });
  const [players, setPlayers]   = useState<PlayerStats[]>([]);
  const [matches, setMatches]   = useState<Match[]>([]);
  const [teams, setTeams]       = useState<TeamStat[]>([]);
  const [leagues, setLeagues]   = useState<League[]>([]);
  const [league, setLeague]     = useState<League | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [leaguesLoading, setLeaguesLoading] = useState(true);
  const [recordOpen, setRecordOpen] = useState(false);
  const [shareOpen, setShareOpen]   = useState(false);
  const [newLeagueOpen, setNewLeagueOpen] = useState(false);
  const [browsingDemo, setBrowsingDemo] = useState(false);
  const [dark, setDark]         = useState(false);

  // Dark mode
  useEffect(() => {
    const r = document.documentElement;
    if (dark) {
      r.style.setProperty('--bg',       '#1a1814');
      r.style.setProperty('--surface',  '#23201a');
      r.style.setProperty('--surface-2','#2c2922');
      r.style.setProperty('--border',   '#3a352c');
      r.style.setProperty('--text',     '#f0ebde');
      r.style.setProperty('--text-2',   '#a59f8e');
      r.style.setProperty('--text-3',   '#6e6a5e');
    } else {
      r.style.setProperty('--bg',       '#fbf7ee');
      r.style.setProperty('--surface',  '#ffffff');
      r.style.setProperty('--surface-2','#f5f1e5');
      r.style.setProperty('--border',   '#e7e2d4');
      r.style.setProperty('--text',     '#1d1a14');
      r.style.setProperty('--text-2',   '#6c6657');
      r.style.setProperty('--text-3',   '#a8a08e');
    }
  }, [dark]);

  // Which leagues can this visitor see? Signed in: their own plus anything shared
  // with them. Signed out: the read-only demo, and only if they asked for it.
  const loadLeagues = useCallback(async () => {
    setLeaguesLoading(true);
    try {
      if (user) {
        const mine = await getMyLeagues();
        setLeagues(mine);
        setLeague(prev => {
          if (prev && mine.some(l => l.id === prev.id)) return mine.find(l => l.id === prev.id)!;
          const remembered = typeof window !== 'undefined' ? localStorage.getItem(LAST_LEAGUE_KEY) : null;
          return mine.find(l => l.id === remembered) ?? mine[0] ?? null;
        });
      } else {
        const demo = await getDemoLeague();
        setLeagues(demo ? [demo] : []);
        setLeague(demo);
      }
    } catch (e) { console.error(e); }
    finally { setLeaguesLoading(false); }
  }, [user?.id]);

  useEffect(() => { if (!authLoading) loadLeagues(); }, [authLoading, loadLeagues]);

  useEffect(() => {
    if (league && !league.is_demo) localStorage.setItem(LAST_LEAGUE_KEY, league.id);
  }, [league?.id]);

  const refresh = useCallback(() => {
    if (!league) { setDataLoading(false); return; }
    setDataLoading(true);
    Promise.all([getPlayerStats(league.id), getMatches(league.id), getTeamStats(league.id)])
      .then(([p, m, t]) => { setPlayers(p); setMatches(m); setTeams(t); })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, [league?.id]);

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

  const switchLeague = (id: string) => {
    const next = leagues.find(l => l.id === id);
    if (next) { setLeague(next); setRoute({ name: 'home' }); }
  };

  // ── Gates ───────────────────────────────────────────────────────────────
  if (authLoading) return <Splash />;

  if (!user && !browsingDemo) {
    return <Landing onSignIn={signIn} onDemo={() => setBrowsingDemo(true)} />;
  }

  if (leaguesLoading) return <Splash />;

  if (user && leagues.length === 0) {
    return (
      <LeagueNameCard
        title="Name your game night"
        blurb="This is where your matches, players and standings live. Only you can see it until you share it with your family."
        suggestion={suggestName(user.user_metadata?.full_name ?? user.email ?? '')}
        cta="Get started"
        onCreated={loadLeagues}
        secondary={{ label: 'Sign out', onClick: signOut }}
        fullscreen
      />
    );
  }

  if (!league) return <Splash label="Nothing to show yet." />;

  const canEdit = !!user && !league.is_demo && (league.role === 'owner' || league.role === 'editor');

  const view = () => {
    switch (route.name) {
      case 'home':      return <HomeView players={players} matches={matches} teams={teams} onNav={nav} />;
      case 'standings': return <StandingsView players={players} teams={teams} matches={matches} onNav={nav} />;
      case 'matches':   return <MatchesView matches={matches} onNav={nav} />;
      case 'match':     return <MatchView matchId={route.matchId} onNav={nav} />;
      case 'player':    return <PlayerView playerId={route.playerId} players={players} matches={matches} teams={teams} onNav={nav} />;
      case 'h2h':       return <H2HView initial={{ a: route.a, b: route.b }} players={players} matches={matches} onNav={nav} />;
      case 'settings':  return <SettingsView players={players} onNav={nav} onRefresh={refresh} leagueId={league.id} canEdit={canEdit} />;
      default:          return null;
    }
  };

  return (
    <>
      <Shell
        route={route} nav={nav}
        onRecord={() => setRecordOpen(true)}
        players={players} dark={dark} onToggleDark={() => setDark(d=>!d)}
        league={league} leagues={leagues} onSwitchLeague={switchLeague}
        canEdit={canEdit} user={user}
        onSignIn={signIn} onSignOut={signOut}
        onShare={() => setShareOpen(true)}
        onNewLeague={() => setNewLeagueOpen(true)}
      >
        {dataLoading ? <div style={{ padding:'40px 0', color:'var(--text-2)', fontSize:14 }}>Loading…</div> : view()}
      </Shell>

      {canEdit && (
        <RecordModal
          open={recordOpen}
          onClose={() => setRecordOpen(false)}
          players={players.filter(p => !p.archived)}
          leagueId={league.id}
          onSaved={() => { setRecordOpen(false); refresh(); nav('matches'); }}
        />
      )}

      {shareOpen && user && !league.is_demo && (
        <ShareModal league={league} onClose={() => setShareOpen(false)} onChanged={loadLeagues} />
      )}

      {newLeagueOpen && (
        <LeagueNameCard
          title="New league"
          blurb="A separate set of players and matches. Handy if you keep score for more than one group."
          suggestion=""
          cta="Create"
          onCreated={() => { setNewLeagueOpen(false); loadLeagues(); }}
          secondary={{ label: 'Cancel', onClick: () => setNewLeagueOpen(false) }}
        />
      )}
    </>
  );
}

function Splash({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', color:'var(--text-2)', fontSize:14 }}>
      {label}
    </div>
  );
}

function suggestName(name: string): string {
  const first = (name || '').trim().split(' ')[0];
  return first && !first.includes('@') ? `${first}'s 42` : 'My 42';
}

/** Used both for a brand new account's first league and for adding another one. */
function LeagueNameCard({ title, blurb, suggestion, cta, onCreated, secondary, fullscreen }: {
  title: string; blurb: string; suggestion: string; cta: string;
  onCreated: () => void; secondary: { label: string; onClick: () => void }; fullscreen?: boolean;
}) {
  const [value, setValue] = useState(suggestion);
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');

  const go = async () => {
    if (!value.trim()) { setError('Give it a name.'); return; }
    setBusy(true); setError('');
    try { await createLeague(value.trim()); onCreated(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Could not create.'); setBusy(false); }
  };

  const card = (
    <div style={{ width:'min(420px,100%)', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:13, padding:'26px 26px 20px', boxShadow: fullscreen ? undefined : '0 24px 60px rgba(0,0,0,0.2)' }}
         onClick={e => e.stopPropagation()}>
      <h1 style={{ margin:'0 0 8px', fontSize:19, fontWeight:600 }}>{title}</h1>
      <p style={{ margin:'0 0 18px', fontSize:13.5, color:'var(--text-2)', lineHeight:1.55 }}>{blurb}</p>
      <input value={value} onChange={e=>setValue(e.target.value)} autoFocus placeholder="Sunday night 42"
             onKeyDown={e => e.key === 'Enter' && !busy && go()}
             style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 12px', fontFamily:'inherit', fontSize:14.5, color:'var(--text)', width:'100%' }} />
      {error && <div style={{ marginTop:10, fontSize:12.5, color:'var(--bad)' }}>{error}</div>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:18 }}>
        <Btn kind="bare" onClick={secondary.onClick}>{secondary.label}</Btn>
        <Btn kind="accent" onClick={go} style={{ opacity: busy ? 0.6 : 1 }}>{busy ? 'Creating…' : cta}</Btn>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        {card}
      </div>
    );
  }
  return (
    <div onClick={secondary.onClick}
         style={{ position:'fixed', inset:0, background:'rgba(20,18,14,0.45)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      {card}
    </div>
  );
}
