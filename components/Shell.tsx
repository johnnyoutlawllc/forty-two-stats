'use client';
import { useState } from 'react';
import { useIsMobile } from './ui';
import type { Route, PlayerStats, League } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

interface ShellProps {
  route: Route;
  nav: (name: string, param?: string) => void;
  onRecord: () => void;
  players: PlayerStats[];
  dark: boolean;
  onToggleDark: () => void;
  league: League;
  leagues: League[];
  onSwitchLeague: (id: string) => void;
  canEdit: boolean;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onShare: () => void;
  onNewLeague: () => void;
  children: React.ReactNode;
}

export function Shell(props: ShellProps) {
  const { route, nav, onRecord, players, dark, onToggleDark, league, canEdit, user, onSignIn, children } = props;
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      {!isMobile && <Sidebar {...props} />}

      {isMobile && drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(20,18,14,0.4)', zIndex:60 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:260, height:'100vh' }}>
            <Sidebar {...props}
              nav={n => { nav(n); setDrawerOpen(false); }}
              onRecord={() => { onRecord(); setDrawerOpen(false); }}
              onShare={() => { props.onShare(); setDrawerOpen(false); }}
              mobile />
          </div>
        </div>
      )}

      <main style={{ flex:1, padding: isMobile ? '16px 16px 80px' : '28px 36px 60px', minWidth:0, maxWidth:1240 }}>
        {league.is_demo && (
          <DemoBanner onSignIn={onSignIn} signedIn={!!user} isMobile={isMobile} />
        )}
        <Topbar {...props} isMobile={isMobile} onMenu={() => setDrawerOpen(true)} />
        <div style={{ marginTop: isMobile ? 16 : 22 }}>{children}</div>
      </main>

      {isMobile && <BottomNav route={route} nav={nav} onRecord={onRecord} canEdit={canEdit} />}
    </div>
  );
}

function DemoBanner({ onSignIn, signedIn, isMobile }: { onSignIn: () => void; signedIn: boolean; isMobile: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:16, padding:'11px 15px', borderRadius:9, background:'color-mix(in oklab, var(--accent) 9%, var(--surface))', border:'1px solid color-mix(in oklab, var(--accent) 26%, var(--border))' }}>
      <span style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.5, flex:1, minWidth:200 }}>
        <strong style={{ color:'var(--text)' }}>This is a sample family.</strong>{' '}
        Every name and score here is made up, so you can see how the app works.
        {!signedIn && ' Sign in to start logging your own.'}
      </span>
      {!signedIn && (
        <button onClick={onSignIn} style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:7, padding:'7px 13px', fontFamily:'inherit', fontSize: isMobile ? 12.5 : 13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
          Sign in with Google
        </button>
      )}
    </div>
  );
}

function Sidebar({ route, nav, onRecord, players, dark, onToggleDark, league, leagues,
                   onSwitchLeague, canEdit, user, onSignIn, onSignOut, onShare, onNewLeague, mobile }:
                   ShellProps & { mobile?: boolean }) {
  const items = [
    { id:'home',      label:'Home',         icon:'⌂' },
    { id:'standings', label:'Standings',    icon:'☷' },
    { id:'matches',   label:'Matches',      icon:'◫' },
    { id:'h2h',       label:'Head-to-head', icon:'⇄' },
    { id:'settings',  label:'Players',      icon:'◔' },
  ];

  return (
    <aside style={{ width: mobile ? 260 : 220, flexShrink:0, background:'var(--surface-2)', borderRight:'1px solid var(--border)', padding:'20px 14px', position: mobile ? 'static' : 'sticky', top:0, height:'100vh', display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 8px 14px' }}>
        <img src="/icon.svg" alt="42 stats" width={32} height={32} style={{ borderRadius:8, flexShrink:0 }} />
        <div>
          <div style={{ fontWeight:600, fontSize:14, letterSpacing:'-0.01em' }}>42 stats</div>
          <div style={{ fontSize:11, color:'var(--text-2)' }}>family edition</div>
        </div>
      </div>

      <LeaguePicker league={league} leagues={leagues} onSwitch={onSwitchLeague}
                    onNew={onNewLeague} signedIn={!!user} />

      {canEdit && (
        <button onClick={onRecord} style={{ marginTop:10, background:'var(--accent)', color:'white', border:'none', borderRadius:8, padding:'9px 12px', fontFamily:'inherit', fontWeight:600, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
          <span style={{ fontSize:15 }}>＋</span> Record match
        </button>
      )}

      <nav style={{ marginTop:16, display:'flex', flexDirection:'column', gap:2 }}>
        {items.map(it => {
          const active = route.name === it.id;
          return (
            <button key={it.id} onClick={() => nav(it.id)} style={{ background: active ? 'var(--surface)' : 'transparent', border:'none', textAlign:'left', padding:'8px 12px', borderRadius:7, cursor:'pointer', display:'flex', alignItems:'center', gap:10, color: active ? 'var(--text)' : 'var(--text-2)', fontFamily:'inherit', fontSize:13, fontWeight: active ? 600 : 500, boxShadow: active ? 'inset 0 0 0 1px var(--border)' : 'none' }}>
              <span style={{ fontSize:14, opacity:0.7, width:16, textAlign:'center' }}>{it.icon}</span>{it.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop:22, fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-3)', padding:'0 12px 6px' }}>Players</div>
      <nav style={{ display:'flex', flexDirection:'column', gap:1 }}>
        {players.filter(p => !p.archived).slice(0, 10).map(p => {
          const active = route.name === 'player' && (route as any).playerId === p.id;
          return (
            <button key={p.id} onClick={() => nav('player', p.id)} style={{ background: active ? 'var(--surface)' : 'transparent', border:'none', textAlign:'left', padding:'6px 10px', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', gap:9, color: active ? 'var(--text)' : 'var(--text-2)', fontFamily:'inherit', fontSize:12.5, fontWeight: active ? 600 : 500 }}>
              <span style={{ width:22, height:22, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, flexShrink:0, background:`color-mix(in oklab, ${p.color} 22%, var(--surface))`, color:`color-mix(in oklab, ${p.color} 85%, var(--text))`, border:`1px solid color-mix(in oklab, ${p.color} 35%, var(--border))` }}>{p.name[0]}</span>
              <span style={{ flex:1 }}>{p.name}</span>
              <span style={{ fontFamily:'monospace', fontSize:10.5, color:'var(--text-3)' }}>{p.wins}-{p.losses}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop:'auto', paddingTop:14, borderTop:'1px solid var(--border)' }}>
        <AccountBlock user={user} onSignIn={onSignIn} onSignOut={onSignOut}
                      onShare={onShare} league={league} />
        <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, color:'var(--text-3)' }}>v0.3.0</span>
          <button onClick={onToggleDark} title="Toggle dark mode" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'5px 8px', cursor:'pointer', fontSize:14, color:'var(--text-2)', lineHeight:1 }}>
            {dark ? '☀' : '◑'}
          </button>
        </div>
      </div>
    </aside>
  );
}

function LeaguePicker({ league, leagues, onSwitch, onNew, signedIn }: {
  league: League; leagues: League[]; onSwitch: (id:string)=>void; onNew: ()=>void; signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!signedIn) {
    return (
      <div style={{ padding:'8px 11px', borderRadius:8, background:'var(--surface)', border:'1px solid var(--border)', fontSize:12.5, color:'var(--text-2)' }}>
        {league.name}
      </div>
    );
  }
  return (
    <div style={{ position:'relative' }}>
      <button onClick={() => setOpen(o=>!o)} style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 11px', borderRadius:8, background:'var(--surface)', border:'1px solid var(--border)', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
        <span style={{ flex:1, minWidth:0, fontSize:12.5, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{league.name}</span>
        <span style={{ fontSize:9, color:'var(--text-3)' }}>▼</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, zIndex:70 }} />
          <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:71, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:9, boxShadow:'0 10px 30px rgba(0,0,0,0.14)', overflow:'hidden' }}>
            {leagues.map(l => (
              <button key={l.id} onClick={() => { onSwitch(l.id); setOpen(false); }}
                style={{ width:'100%', textAlign:'left', padding:'9px 12px', background: l.id === league.id ? 'var(--surface-2)' : 'transparent', border:'none', borderBottom:'1px solid var(--border)', cursor:'pointer', fontFamily:'inherit' }}>
                <div style={{ fontSize:12.5, fontWeight: l.id === league.id ? 600 : 500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.name}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>
                  {l.role === 'owner' ? 'Yours' : `Shared by ${l.owner_name ?? 'someone'}`}
                </div>
              </button>
            ))}
            <button onClick={() => { onNew(); setOpen(false); }}
              style={{ width:'100%', textAlign:'left', padding:'9px 12px', background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12.5, color:'var(--text-2)' }}>
              ＋ New league
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AccountBlock({ user, onSignIn, onSignOut, onShare, league }: {
  user: User | null; onSignIn: ()=>void; onSignOut: ()=>void; onShare: ()=>void; league: League;
}) {
  if (!user) {
    return (
      <button onClick={onSignIn} style={{ width:'100%', background:'var(--accent)', color:'#fff', border:'none', borderRadius:7, padding:'8px 12px', fontFamily:'inherit', fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
        Sign in with Google
      </button>
    );
  }
  const name = user.user_metadata?.full_name ?? user.email ?? 'Signed in';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
      <div style={{ fontSize:12, color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={user.email ?? ''}>
        {name}
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {!league.is_demo && (
          <button onClick={onShare} style={{ flex:1, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'5px 8px', cursor:'pointer', fontSize:11.5, color:'var(--text)', fontFamily:'inherit' }}>
            Share
          </button>
        )}
        <button onClick={onSignOut} style={{ flex:1, background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'5px 8px', cursor:'pointer', fontSize:11.5, color:'var(--text-2)', fontFamily:'inherit' }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function Topbar({ route, nav, onRecord, isMobile, players, onMenu, canEdit, league, user, onShare }:
  ShellProps & { isMobile: boolean; onMenu: () => void }) {
  const crumb = ({
    home:['Home'], standings:['Standings'], matches:['Matches'],
    h2h:['Head-to-head'], settings:['Players'],
    player:['Players', players.find(p=>p.id===(route as any).playerId)?.name ?? ''],
    match:['Matches','Detail'],
  } as Record<string,string[]>)[route.name] ?? ['—'];

  if (isMobile) {
    return (
      <header style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={onMenu} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:7, width:32, height:32, cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:16, color:'var(--text)' }}>☰</span>
        </button>
        <div style={{ flex:1, fontSize:15, fontWeight:600 }}>{crumb[crumb.length-1]}</div>
        {canEdit && (
          <button onClick={onRecord} style={{ background:'var(--accent)', color:'white', border:'none', borderRadius:7, padding:'7px 12px', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>＋</button>
        )}
      </header>
    );
  }
  return (
    <header style={{ display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-2)' }}>
        {crumb.map((c, i) => (
          <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
            {i > 0 && <span style={{ color:'var(--text-3)' }}>/</span>}
            <span style={{ color: i===crumb.length-1?'var(--text)':'var(--text-2)', fontWeight:i===crumb.length-1?500:400 }}>{c}</span>
          </span>
        ))}
      </div>
      <div style={{ flex:1 }} />
      <button onClick={() => nav('h2h')} style={topBtn(route.name==='h2h')}>⇄ Compare</button>
      {user && !league.is_demo && (
        <button onClick={onShare} style={topBtn(false)}>⇗ Share</button>
      )}
      {canEdit && (
        <button onClick={onRecord} style={{ ...topBtn(false), background:'var(--text)', color:'var(--surface)', borderColor:'var(--text)' }}>＋ Record match</button>
      )}
    </header>
  );
}

function topBtn(active: boolean): React.CSSProperties {
  return { background: active?'var(--surface-2)':'var(--surface)', border:'1px solid var(--border)', borderRadius:7, padding:'6px 11px', fontFamily:'inherit', fontSize:13, fontWeight:500, color:'var(--text)', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 };
}

function BottomNav({ route, nav, onRecord, canEdit }: { route:Route; nav:(n:string)=>void; onRecord:()=>void; canEdit:boolean }) {
  const items = [
    { id:'home',      label:'Home',     icon:'⌂' },
    { id:'standings', label:'Rank',     icon:'☷' },
    ...(canEdit ? [{ id:'_record', label:'', icon:'＋', fab:true }] : []),
    { id:'matches',   label:'Matches',  icon:'◫' },
    { id:'settings',  label:'Players',  icon:'◔' },
  ] as { id:string; label:string; icon:string; fab?:boolean }[];
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, height:64, background:'var(--surface)', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-around', zIndex:40, paddingBottom:'env(safe-area-inset-bottom)' }}>
      {items.map(it => it.fab
        ? <button key="fab" onClick={onRecord} style={{ width:52, height:52, borderRadius:'50%', background:'var(--accent)', color:'white', border:'none', fontSize:22, cursor:'pointer', marginTop:-16, boxShadow:'0 6px 16px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>{it.icon}</button>
        : <button key={it.id} onClick={() => nav(it.id)} style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2, color: route.name===it.id?'var(--accent)':'var(--text-2)', padding:'6px 14px', fontFamily:'inherit' }}>
            <span style={{ fontSize:18, lineHeight:1 }}>{it.icon}</span>
            <span style={{ fontSize:10, fontWeight:500 }}>{it.label}</span>
          </button>
      )}
    </nav>
  );
}
