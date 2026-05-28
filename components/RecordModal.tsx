'use client';
import { useState } from 'react';
import { Pill, Btn, Avatar, TeamLabel } from './ui';
import { saveMatch, type NewMatchPayload } from '@/lib/data';
import type { PlayerStats } from '@/lib/types';

const IS = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontFamily:'inherit', fontSize:14, color:'var(--text)', width:'100%' };
const RB = { background:'transparent', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:20, padding:0, lineHeight:1 as any };
const tog = (on: boolean): React.CSSProperties => ({ background: on ? 'var(--text)' : 'transparent', color: on ? 'var(--surface)' : 'var(--text-2)', border:'none', padding:'6px 12px', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:500 });
function Lbl({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-2)', fontWeight:500, marginBottom:8 }}>{children}</div>;
}

interface Game { t1: number; t2: number; }
interface Bid  { by: string; bid: string|number; made: boolean; }

export function RecordModal({ open, onClose, players, onSaved }: { open: boolean; onClose: () => void; players: PlayerStats[]; onSaved: () => void }) {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [picked, setPicked] = useState<string[]>([]);
  const [team1, setTeam1] = useState<string[]>([]);
  const [team2, setTeam2] = useState<string[]>([]);
  const [games, setGames] = useState<Game[]>([{ t1: 7, t2: 0 }]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const steps = ['Players & teams', 'Games', 'Bids', 'Review'];
  const t1Wins = games.filter(g => g.t1 > g.t2).length;
  const t2Wins = games.filter(g => g.t2 > g.t1).length;
  const t1Short = team1.map(id => players.find(p => p.id === id)?.name[0] ?? '?').join('/');
  const t2Short = team2.map(id => players.find(p => p.id === id)?.name[0] ?? '?').join('/');

  const updateGame = (i: number, field: 't1'|'t2', v: number) =>
    setGames(gs => gs.map((g, j) => j === i ? { ...g, [field]: v } : g));
  const updateBid = (i: number, field: keyof Bid, v: any) =>
    setBids(bs => bs.map((b, j) => j === i ? { ...b, [field]: v } : b));

  const handleSave = async () => {
    if (team1.length !== 2 || team2.length !== 2) { setError('Need exactly 2 players per team.'); return; }
    if (games.length === 0) { setError('Add at least one game.'); return; }
    setSaving(true); setError('');
    try {
      await saveMatch({ played_on: date, team1: [team1[0], team1[1]], team2: [team2[0], team2[1]], games, bids });
      setStep(0); setDate(new Date().toISOString().slice(0,10));
      setPicked([]); setTeam1([]); setTeam2([]);
      setGames([{ t1:7, t2:0 }]); setBids([]);
      onSaved(); onClose();
    } catch (e: any) { setError(e.message ?? 'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(20,18,14,0.45)', zIndex:100, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'60px 20px', overflowY:'auto' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)', borderRadius:14, width:'min(720px,100%)', boxShadow:'0 24px 60px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.08)', border:'1px solid var(--border)', overflow:'hidden' }}>

        {/* Header */}
        <header style={{ padding:'16px 22px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h2 style={{ margin:0, fontSize:17, fontWeight:600 }}>Record a match</h2>
            <div style={{ marginTop:4, fontSize:12, color:'var(--text-2)' }}>Step {step+1} of {steps.length} — {steps[step]}</div>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:22, color:'var(--text-2)', padding:4, lineHeight:1 }}>×</button>
        </header>

        {/* Progress */}
        <div style={{ display:'flex', gap:4, padding:'12px 22px 0' }}>
          {steps.map((_, i) => <div key={i} style={{ flex:1, height:3, borderRadius:999, background: i <= step ? 'var(--accent)' : 'var(--surface-2)' }} />)}
        </div>

        {/* Body */}
        <div style={{ padding:'20px 22px', minHeight:320 }}>

          {/* Step 0 — Players & teams */}
          {step === 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div>
                <Lbl>Date</Lbl>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={IS} />
              </div>
              <div>
                <Lbl>Who played?</Lbl>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {players.map(p => {
                    const on = picked.includes(p.id);
                    return (
                      <button key={p.id} onClick={() => {
                        setPicked(prev => on ? prev.filter(x => x !== p.id) : [...prev, p.id]);
                        if (on) { setTeam1(t => t.filter(x => x !== p.id)); setTeam2(t => t.filter(x => x !== p.id)); }
                      }} style={{ display:'inline-flex', alignItems:'center', gap:6, background: on ? 'color-mix(in oklab, var(--accent) 12%, var(--surface))' : 'var(--surface)', border:`1px solid ${on ? 'color-mix(in oklab, var(--accent) 35%, var(--border))' : 'var(--border)'}`, color: on ? 'var(--accent)' : 'var(--text)', padding:'6px 11px 6px 6px', borderRadius:999, cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight: on ? 600 : 500 }}>
                        <Avatar name={p.name} color={p.color} size="sm" />{p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div><Lbl>Team 1</Lbl><TeamPicker pool={picked} value={team1} other={team2} onChange={setTeam1} players={players} /></div>
                <div><Lbl>Team 2</Lbl><TeamPicker pool={picked} value={team2} other={team1} onChange={setTeam2} players={players} /></div>
              </div>
            </div>
          )}

          {/* Step 1 — Games */}
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Lbl>Game scores (each game to 7)</Lbl>
              {games.map((g, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 1fr auto 1fr 80px 32px', alignItems:'center', gap:10 }}>
                  <span style={{ color:'var(--text-2)', fontSize:13 }}>Game {i+1}</span>
                  <input type="number" min="0" max="7" value={g.t1} onChange={e => updateGame(i,'t1',+e.target.value)} style={{ ...IS, textAlign:'center', fontFamily:'monospace' }} />
                  <span style={{ color:'var(--text-3)' }}>–</span>
                  <input type="number" min="0" max="7" value={g.t2} onChange={e => updateGame(i,'t2',+e.target.value)} style={{ ...IS, textAlign:'center', fontFamily:'monospace' }} />
                  <Pill tone={g.t1===g.t2 ? 'neutral' : g.t1>g.t2 ? 'good' : 'bad'} size="sm">
                    {g.t1===g.t2 ? '—' : g.t1>g.t2 ? t1Short : t2Short}
                  </Pill>
                  <button onClick={() => setGames(gs => gs.filter((_,j) => j!==i))} style={RB}>×</button>
                </div>
              ))}
              <Btn kind="ghost" onClick={() => setGames(gs => [...gs, { t1:7, t2:0 }])} icon="+" style={{ alignSelf:'flex-start' }}>Add game</Btn>
              <div style={{ marginTop:8, padding:'12px 16px', background:'var(--surface-2)', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:12, color:'var(--text-2)' }}>Series so far</span>
                <span style={{ fontSize:15, fontFamily:'monospace', fontWeight:600 }}>{t1Short} {t1Wins} – {t2Wins} {t2Short}</span>
              </div>
            </div>
          )}

          {/* Step 2 — Bids */}
          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Lbl>Bids called <span style={{ color:'var(--text-3)', textTransform:'none', letterSpacing:0 }}>(optional)</span></Lbl>
              {bids.map((b, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1.2fr 1.4fr 1fr 32px', gap:8, alignItems:'center' }}>
                  <select value={b.by} onChange={e => updateBid(i,'by',e.target.value)} style={IS}>
                    {picked.map(id => <option key={id} value={id}>{players.find(p=>p.id===id)?.name}</option>)}
                  </select>
                  <BidPicker value={b.bid} onChange={v => updateBid(i,'bid',v)} />
                  <div style={{ display:'inline-flex', border:'1px solid var(--border)', borderRadius:7, overflow:'hidden' }}>
                    <button onClick={() => updateBid(i,'made',true)} style={tog(b.made)}>Made</button>
                    <button onClick={() => updateBid(i,'made',false)} style={tog(!b.made)}>Set</button>
                  </div>
                  <button onClick={() => setBids(bs => bs.filter((_,j) => j!==i))} style={RB}>×</button>
                </div>
              ))}
              <Btn kind="ghost" onClick={() => setBids(bs => [...bs, { by: picked[0]??'', bid:31, made:true }])} icon="+" style={{ alignSelf:'flex-start' }}>Add bid</Btn>
              <p style={{ margin:'4px 0 0', fontSize:12, color:'var(--text-3)', lineHeight:1.5 }}>Common bids: 30–41 · 1m=42 · 2m=84 · 3m=126 · plunge, nello, sevens</p>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Lbl>Review &amp; save</Lbl>
              <div style={{ background:'var(--surface-2)', borderRadius:10, padding:18 }}>
                <div style={{ fontSize:12, color:'var(--text-2)', letterSpacing:'0.05em', textTransform:'uppercase' }}>{new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:16, marginTop:10 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {team1.map(id => { const p=players.find(x=>x.id===id); return p ? <span key={id} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:14, fontWeight:500 }}><Avatar name={p.name} color={p.color} size="md2" />{p.name}</span> : null; })}
                  </div>
                  <span style={{ fontFamily:'monospace', fontSize:28, fontWeight:600, textAlign:'center' }}>{t1Wins} – {t2Wins}</span>
                  <div style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'flex-end' }}>
                    {team2.map(id => { const p=players.find(x=>x.id===id); return p ? <span key={id} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:14, fontWeight:500 }}><Avatar name={p.name} color={p.color} size="md2" />{p.name}</span> : null; })}
                  </div>
                </div>
                <div style={{ marginTop:14, display:'flex', gap:6, flexWrap:'wrap' }}>
                  {games.map((g,i) => <Pill key={i} tone={g.t1>g.t2?'good':'bad'} size="sm">G{i+1} · {g.t1}–{g.t2}</Pill>)}
                </div>
                {bids.length > 0 && <div style={{ marginTop:12, fontSize:12, color:'var(--text-2)' }}>{bids.length} bid{bids.length===1?'':'s'} — {bids.filter(b=>b.made).length} made, {bids.filter(b=>!b.made).length} set.</div>}
              </div>
              {error && <div style={{ padding:'10px 14px', background:'color-mix(in oklab, var(--bad) 10%, var(--surface))', border:'1px solid color-mix(in oklab, var(--bad) 25%, var(--border))', borderRadius:8, fontSize:13, color:'var(--bad)' }}>{error}</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
          <Btn kind="bare" onClick={onClose}>Cancel</Btn>
          <div style={{ display:'flex', gap:8 }}>
            {step > 0 && <Btn kind="ghost" onClick={() => setStep(s=>s-1)}>← Back</Btn>}
            {step < steps.length-1
              ? <Btn kind="primary" onClick={() => setStep(s=>s+1)}>Continue →</Btn>
              : <Btn kind="accent" onClick={handleSave} style={{ opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Save match'}</Btn>
            }
          </div>
        </footer>
      </div>
    </div>
  );
}

function TeamPicker({ pool, value, other, onChange, players }: { pool: string[]; value: string[]; other: string[]; onChange: (v: string[]) => void; players: PlayerStats[] }) {
  return (
    <div style={{ border:'1px solid var(--border)', borderRadius:8, padding:8, minHeight:60, display:'flex', gap:6, flexWrap:'wrap', background:'var(--surface)' }}>
      {pool.length===0 && <span style={{ color:'var(--text-3)', fontSize:12, padding:4 }}>pick players above first</span>}
      {pool.map(id => {
        const on=value.includes(id), taken=other.includes(id);
        const p=players.find(x=>x.id===id);
        if (!p) return null;
        return (
          <button key={id} disabled={taken&&!on} onClick={() => onChange(on ? value.filter(x=>x!==id) : [...value, id])} style={{ display:'inline-flex', alignItems:'center', gap:5, background: on ? 'color-mix(in oklab, var(--accent) 14%, var(--surface))' : 'transparent', border:`1px solid ${on ? 'color-mix(in oklab, var(--accent) 35%, var(--border))' : 'var(--border)'}`, color: on ? 'var(--accent)' : taken ? 'var(--text-3)' : 'var(--text)', opacity: taken&&!on ? 0.4 : 1, padding:'4px 9px 4px 4px', borderRadius:999, cursor: taken&&!on ? 'not-allowed' : 'pointer', fontSize:12, fontFamily:'inherit', fontWeight:500 }}>
            <Avatar name={p.name} color={p.color} size="sm" />{p.name}
          </button>
        );
      })}
    </div>
  );
}

function BidPicker({ value, onChange }: { value: string|number; onChange: (v: string|number) => void }) {
  const [open, setOpen] = useState(false);
  const presets = [
    {v:30,l:'30'},{v:31,l:'31'},{v:32,l:'32'},{v:33,l:'33'},
    {v:34,l:'34'},{v:35,l:'35'},{v:36,l:'36'},{v:41,l:'41'},
    {v:42,l:'1m'},{v:84,l:'2m'},{v:126,l:'3m'},{v:168,l:'4m'},
    {v:'plunge',l:'plunge'},{v:'nello',l:'nello'},{v:'sevens',l:'sevens'},
  ] as const;
  const label = presets.find(p=>p.v===value)?.l ?? (value ? String(value) : 'pick…');
  return (
    <div style={{ position:'relative' }}>
      <button onClick={() => setOpen(v=>!v)} style={{ ...IS, textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily: typeof value==='number' ? 'monospace' : 'inherit' }}>{label}</span>
        <span style={{ color:'var(--text-3)', fontSize:11 }}>▾</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, zIndex:50 }} />
          <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:51, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:8, minWidth:220, boxShadow:'0 8px 20px rgba(0,0,0,0.12)', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4 }}>
            {presets.map(p => (
              <button key={String(p.v)} onClick={() => { onChange(p.v); setOpen(false); }} style={{ background: value===p.v ? 'color-mix(in oklab, var(--accent) 14%, var(--surface))' : 'transparent', border:`1px solid ${value===p.v ? 'color-mix(in oklab, var(--accent) 35%, var(--border))' : 'transparent'}`, borderRadius:6, padding:'6px 4px', cursor:'pointer', fontFamily: typeof p.v==='number' ? 'monospace' : 'inherit', fontSize:12, color: value===p.v ? 'var(--accent)' : 'var(--text)', fontWeight: value===p.v ? 600 : 500 }}>{p.l}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
