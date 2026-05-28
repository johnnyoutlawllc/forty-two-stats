'use client';
import { useState } from 'react';
import { useIsMobile } from './ui';
import type { Route, PlayerStats } from '@/lib/types';

interface ShellProps {
  route: Route;
  nav: (name: string, param?: string) => void;
  onRecord: () => void;
  players: PlayerStats[];
  dark: boolean;
  onToggleDark: () => void;
  children: React.ReactNode;
}

export function Shell({ route, nav, onRecord, players, dark, onToggleDark, children }: ShellProps) {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar route={route} nav={nav} onRecord={onRecord} players={players} dark={dark} onToggleDark={onToggleDark} />
      )}

      {/* Mobile drawer overlay */}
      {isMobile && drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(20,18,14,0.4)', zIndex:60 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:260, height:'100vh' }}>
            <Sidebar route={route} nav={n => { nav(n); setDrawerOpen(false); }} onRecord={() => { onRecord(); setDrawerOpen(false); }} players={players} dark={dark} onToggleDark={onToggleDark} mobile />
          </div>
        </div>
      )}

      <main style={{ flex:1, padding: isMobile ? '16px 16px 80px' : '28px 36px 60px', minWidth:0, maxWidth:1240 }}>
        <Topbar route={route} nav={nav} onRecord={onRecord} isMobile={isMobile} players={players} onMenu={() => setDrawerOpen(true)} dark={dark} onToggleDark={onToggleDark} />
        <div style={{ marginTop: isMobile ? 16 : 22 }}>{children}</div>
      </main>

      {isMobile && <BottomNav route={route} nav={nav} onRecord={onRecord} />}
    </div>
  );
}

interface SidebarProps {
  route: Route; nav: (n:string)=>void; onRecord: ()=>void;
  players: PlayerStats[]; dark: boolean; onToggleDark: ()=>void; mobile?: boolean;
}

function Sidebar({ route, nav, onRecord, players, dark, onToggleDark, mobile }: SidebarProps) {
  const items = [
    { id:'home',      label:'Home',         icon:'⌂' },
    { id:'standings', label:'Standings',    icon:'☷' },
    { id:'matches',   label:'Matches',      icon:'◫' },
    { id:'h2h',       label:'Head-to-head', icon:'⇄' },
    { id:'settings',  label:'Players',      icon:'◔' },
  ];
  return (
    <aside style={{ width: mobile ? 260 : 220, flexShrink:0, background:'var(--surface-2)', borderRight:'1px solid var(--border)', padding:'20px 14px', position: mobile ? 'static' : 'sticky', top:0, height:'100vh', display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 8px 16px' }}>
        <img src="/icon.svg" alt="42 stats" width={32} height={32} style={{ borderRadius:8, flexShrink:0 }} />
        <div>
          <div style={{ fontWeight:600, fontSize:14, letterSpacing:'-0.01em' }}>42 stats</div>
          <div style={{ fontSize:11, color:'var(--text-2)' }}>family edition</div>
        </div>
      </div>

      <button onClick={onRecord} style={{ background:'var(--accent)', color:'white', border:'none', borderRadius:8, padding:'9px 12px', fontFamily:'inherit', fontWeight:600, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
        <span style={{ fontSize:15 }}>＋</span> Record match
      </button>

      <nav style={{ marginTop:18, display:'flex', flexDirection:'column', gap:2 }}>
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

      <div style={{ marginTop:'auto', paddingTop:14, borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:11, color:'var(--text-3)' }}>v0.2.0</span>
        <button onClick={onToggleDark} title="Toggle dark mode" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:6, padding:'5px 8px', cursor:'pointer', fontSize:14, color:'var(--text-2)', lineHeight:1 }}>
          {dark ? '☀' : '◑'}
        </button>
      </div>
    </aside>
  );
}

interface TopbarProps {
  route: Route; nav: (n:string)=>void; onRecord: ()=>void;
  isMobile: boolean; players: PlayerStats[]; onMenu: ()=>void;
  dark: boolean; onToggleDark: ()=>void;
}

function Topbar({ route, nav, onRecord, isMobile, players, onMenu, dark, onToggleDark }: TopbarProps) {
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
        <button onClick={onRecord} style={{ background:'var(--accent)', color:'white', border:'none', borderRadius:7, padding:'7px 12px', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>＋</button>
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
      <button onClick={onRecord} style={{ ...topBtn(false), background:'var(--text)', color:'var(--surface)', borderColor:'var(--text)' }}>＋ Record match</button>
    </header>
  );
}

function topBtn(active: boolean): React.CSSProperties {
  return { background: active?'var(--surface-2)':'var(--surface)', border:'1px solid var(--border)', borderRadius:7, padding:'6px 11px', fontFamily:'inherit', fontSize:13, fontWeight:500, color:'var(--text)', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 };
}

function BottomNav({ route, nav, onRecord }: { route:Route; nav:(n:string)=>void; onRecord:()=>void }) {
  const items = [
    { id:'home',      label:'Home',     icon:'⌂' },
    { id:'standings', label:'Rank',     icon:'☷' },
    { id:'_record',   label:'',         icon:'＋', fab:true },
    { id:'matches',   label:'Matches',  icon:'◫' },
    { id:'settings',  label:'Players',  icon:'◔' },
  ];
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
