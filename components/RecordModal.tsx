'use client';
import { useState } from 'react';
import { Pill, Btn, Avatar } from './ui';
import { saveMatch, saveSessionBids } from '@/lib/data';
import type { PlayerStats } from '@/lib/types';

const IS: React.CSSProperties = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontFamily:'inherit', fontSize:14, color:'var(--text)', width:'100%' };
function Lbl({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-2)', fontWeight:500, marginBottom:8 }}>{children}</div>;
}

interface Game { t1: number; t2: number }
interface BidEntry { player_id: string; bids_attempted: number; bids_made: number }

export function RecordModal({ open, onClose, players, leagueId, onSaved }: {
  open: boolean; onClose: () => void; players: PlayerStats[]; leagueId: string; onSaved: () => void;
}) {
  const [step, setStep]   = useState(0);
  const [date, setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [team1, setTeam1] = useState<string[]>([]);
  const [team2, setTeam2] = useState<string[]>([]);
  const [games, setGames] = useState<Game[]>([{ t1: 7, t2: 0 }]);
  const [bidEntries, setBidEntries] = useState<BidEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  if (!open) return null;

  const steps = ['Players & teams', 'Games', 'Bid totals', 'Review'];
  const allPlayers = [...team1, ...team2];
  const t1Wins = games.filter(g => g.t1 > g.t2).length;
  const t2Wins = games.filter(g => g.t2 > g.t1).length;
  const teamShort = (ids: string[]) => ids.map(id => players.find(p => p.id === id)?.name[0] ?? '?').join('/');

  // Init bid entries when entering step 2
  const enterBidStep = () => {
    setBidEntries(allPlayers.map(id => ({ player_id: id, bids_attempted: 0, bids_made: 0 })));
    setStep(2);
  };

  const updateBidEntry = (playerId: string, field: 'bids_attempted'|'bids_made', val: number) => {
    setBidEntries(bs => bs.map(b => b.player_id === playerId ? { ...b, [field]: val } : b));
  };

  const tapPlayer = (id: string) => {
    const inT1 = team1.includes(id), inT2 = team2.includes(id);
    if (!inT1 && !inT2) {
      if (team1.length < 2) setTeam1(t => [...t, id]);
      else if (team2.length < 2) setTeam2(t => [...t, id]);
    } else if (inT1) {
      setTeam1(t => t.filter(x => x !== id));
      if (team2.length < 2) setTeam2(t => [...t, id]);
    } else {
      setTeam2(t => t.filter(x => x !== id));
    }
  };

  const updateGame = (i: number, field: 't1'|'t2', v: number) =>
    setGames(gs => gs.map((g, j) => j === i ? { ...g, [field]: v } : g));

  const handleSave = async () => {
    if (team1.length !== 2 || team2.length !== 2) { setError('Need exactly 2 players per team.'); return; }
    if (games.length === 0) { setError('Add at least one game.'); return; }
    setSaving(true); setError('');
    try {
      const matchId = await saveMatch({
        league_id: leagueId,
        played_on: date, team1: [team1[0], team1[1]], team2: [team2[0], team2[1]], games, bids: []
      });
      const bidsToSave = bidEntries.filter(b => b.bids_attempted > 0);
      if (bidsToSave.length > 0) await saveSessionBids(matchId, bidsToSave);
      setStep(0); setDate(new Date().toISOString().slice(0,10));
      setTeam1([]); setTeam2([]); setGames([{ t1:7, t2:0 }]); setBidEntries([]);
      onSaved();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setSaving(false); }
  };

  const teamSlots = [
    { label:'Team 1', ids:team1, color:'#2e6e57' },
    { label:'Team 2', ids:team2, color:'#3a5a8a' },
  ];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(20,18,14,0.45)', zIndex:100, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'60px 20px', overflowY:'auto' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)', borderRadius:14, width:'min(680px,100%)', boxShadow:'0 24px 60px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.08)', border:'1px solid var(--border)', overflow:'hidden' }}>

        <header style={{ padding:'16px 22px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h2 style={{ margin:0, fontSize:17, fontWeight:600 }}>Record a match</h2>
            <div style={{ marginTop:4, fontSize:12, color:'var(--text-2)' }}>Step {step+1} of {steps.length} — {steps[step]}</div>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:22, color:'var(--text-2)', padding:4, lineHeight:1 }}>×</button>
        </header>

        <div style={{ display:'flex', gap:4, padding:'12px 22px 0' }}>
          {steps.map((_, i) => <div key={i} style={{ flex:1, height:3, borderRadius:999, background: i<=step ? 'var(--accent)' : 'var(--surface-2)' }} />)}
        </div>

        <div style={{ padding:'20px 22px', minHeight:300 }}>

          {/* STEP 0 — Players & teams */}
          {step === 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div>
                <Lbl>Date</Lbl>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={IS} />
              </div>
              <div>
                <Lbl>Tap a player to assign — tap again to switch teams</Lbl>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
                  {players.filter(p => !p.archived).map(p => {
                    const inT1 = team1.includes(p.id), inT2 = team2.includes(p.id);
                    const dot = inT1 ? '#2e6e57' : inT2 ? '#3a5a8a' : null;
                    return (
                      <button key={p.id} onClick={() => tapPlayer(p.id)} style={{ display:'inline-flex', alignItems:'center', gap:6, background: dot ? `color-mix(in oklab, ${dot} 14%, var(--surface))` : 'var(--surface)', border:`1px solid ${dot ? `color-mix(in oklab, ${dot} 35%, var(--border))` : 'var(--border)'}`, color: dot ? `color-mix(in oklab, ${dot} 85%, var(--text))` : 'var(--text-2)', padding:'6px 11px 6px 6px', borderRadius:999, cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight: dot ? 600 : 500 }}>
                        <Avatar name={p.name} color={p.color} size="sm" />{p.name}
                        {dot && <span style={{ width:7, height:7, borderRadius:'50%', background:dot, flexShrink:0 }} />}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {teamSlots.map(slot => (
                    <div key={slot.label}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background:slot.color, display:'inline-block' }} />
                        <span style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-2)', fontWeight:500 }}>{slot.label}</span>
                        <span style={{ fontSize:11, color:'var(--text-3)' }}>{slot.ids.length}/2</span>
                      </div>
                      <div style={{ border:`1px solid ${slot.ids.length===2 ? `color-mix(in oklab, ${slot.color} 35%, var(--border))` : 'var(--border)'}`, borderRadius:8, padding:'10px 12px', minHeight:52, display:'flex', gap:10, alignItems:'center', background:'var(--surface)', flexWrap:'wrap' }}>
                        {slot.ids.length === 0
                          ? <span style={{ color:'var(--text-3)', fontSize:12 }}>tap players above</span>
                          : slot.ids.map(id => { const p=players.find(x=>x.id===id); return p ? <span key={id} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600 }}><Avatar name={p.name} color={p.color} size="md" />{p.name}</span> : null; })
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Games */}
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Lbl>Game scores (each game to 7)</Lbl>
              {games.map((g, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 1fr auto 1fr 90px 32px', alignItems:'center', gap:10 }}>
                  <span style={{ color:'var(--text-2)', fontSize:13 }}>Game {i+1}</span>
                  <input type="number" min="0" max="7" value={g.t1} onChange={e => updateGame(i,'t1',+e.target.value)} style={{ ...IS, textAlign:'center', fontFamily:'monospace' }} />
                  <span style={{ color:'var(--text-3)' }}>–</span>
                  <input type="number" min="0" max="7" value={g.t2} onChange={e => updateGame(i,'t2',+e.target.value)} style={{ ...IS, textAlign:'center', fontFamily:'monospace' }} />
                  <Pill tone={g.t1===g.t2?'neutral':g.t1>g.t2?'good':'bad'} size="sm">
                    {g.t1===g.t2?'—':g.t1>g.t2?teamShort(team1):teamShort(team2)}
                  </Pill>
                  <button onClick={() => setGames(gs=>gs.filter((_,j)=>j!==i))} style={{ background:'transparent', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:20, padding:0, lineHeight:1 }}>×</button>
                </div>
              ))}
              <Btn kind="ghost" onClick={() => setGames(gs=>[...gs,{t1:7,t2:0}])} icon="+" style={{ alignSelf:'flex-start' }}>Add game</Btn>
              <div style={{ marginTop:8, padding:'12px 16px', background:'var(--surface-2)', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:12, color:'var(--text-2)' }}>Series</span>
                <span style={{ fontSize:15, fontFamily:'monospace', fontWeight:600 }}>{teamShort(team1)} {t1Wins} – {t2Wins} {teamShort(team2)}</span>
              </div>
            </div>
          )}

          {/* STEP 2 — Bid totals */}
          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <Lbl>Bid totals for the night <span style={{ color:'var(--text-3)', textTransform:'none', letterSpacing:0, fontWeight:400 }}>(optional)</span></Lbl>
                <p style={{ margin:'0 0 16px', fontSize:13, color:'var(--text-2)', lineHeight:1.5 }}>
                  How many times did each player bid, and how many did they make?
                </p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 120px', gap:8, alignItems:'center' }}>
                <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-3)', fontWeight:500, padding:'0 4px' }}>Player</div>
                <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-3)', fontWeight:500, textAlign:'center' }}>Attempted</div>
                <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-3)', fontWeight:500, textAlign:'center' }}>Made</div>
                {bidEntries.map(b => {
                  const p = players.find(x => x.id === b.player_id);
                  if (!p) return null;
                  const war = b.bids_attempted > 0
                    ? ((b.bids_made - (b.bids_attempted - b.bids_made)) / games.length).toFixed(2)
                    : null;
                  return (
                    <>
                      <div key={`${b.player_id}-label`} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 4px' }}>
                        <Avatar name={p.name} color={p.color} size="md" />
                        <div>
                          <div style={{ fontWeight:500, fontSize:13 }}>{p.name}</div>
                          {war && <div style={{ fontSize:11, color: Number(war)>0?'var(--good)':Number(war)<0?'var(--bad)':'var(--text-3)' }}>BidWAR: {Number(war)>0?'+':''}{war}</div>}
                        </div>
                      </div>
                      <input key={`${b.player_id}-att`} type="number" min="0" value={b.bids_attempted || ''} placeholder="0" onChange={e => {
                        const att = Math.max(0, +e.target.value || 0);
                        updateBidEntry(b.player_id, 'bids_attempted', att);
                        if (b.bids_made > att) updateBidEntry(b.player_id, 'bids_made', att);
                      }} style={{ ...IS, textAlign:'center', fontFamily:'monospace' }} />
                      <input key={`${b.player_id}-made`} type="number" min="0" max={b.bids_attempted} value={b.bids_made || ''} placeholder="0" onChange={e => updateBidEntry(b.player_id, 'bids_made', Math.min(b.bids_attempted, Math.max(0, +e.target.value || 0)))} style={{ ...IS, textAlign:'center', fontFamily:'monospace' }} />
                    </>
                  );
                })}
              </div>
              <p style={{ margin:'4px 0 0', fontSize:11, color:'var(--text-3)', lineHeight:1.5 }}>
                BidWAR = (made − set) ÷ games played. Rewards bidding often AND making them.
              </p>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Lbl>Review &amp; save</Lbl>
              <div style={{ background:'var(--surface-2)', borderRadius:10, padding:18 }}>
                <div style={{ fontSize:12, color:'var(--text-2)', letterSpacing:'0.05em', textTransform:'uppercase' }}>
                  {new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:16, marginTop:10 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    {team1.map(id => { const p=players.find(x=>x.id===id); return p ? <span key={id} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:500 }}><Avatar name={p.name} color={p.color} size="md" />{p.name}</span> : null; })}
                  </div>
                  <span style={{ fontFamily:'monospace', fontSize:28, fontWeight:600, textAlign:'center' }}>{t1Wins} – {t2Wins}</span>
                  <div style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'flex-end', flexWrap:'wrap' }}>
                    {team2.map(id => { const p=players.find(x=>x.id===id); return p ? <span key={id} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:500 }}><Avatar name={p.name} color={p.color} size="md" />{p.name}</span> : null; })}
                  </div>
                </div>
                <div style={{ marginTop:14, display:'flex', gap:6, flexWrap:'wrap' }}>
                  {games.map((g,i) => <Pill key={i} tone={g.t1>g.t2?'good':'bad'} size="sm">G{i+1} · {g.t1}–{g.t2}</Pill>)}
                </div>
                {bidEntries.some(b => b.bids_attempted > 0) && (
                  <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:4 }}>
                    {bidEntries.filter(b => b.bids_attempted > 0).map(b => {
                      const p = players.find(x => x.id === b.player_id);
                      const war = ((b.bids_made - (b.bids_attempted - b.bids_made)) / games.length).toFixed(2);
                      return <div key={b.player_id} style={{ fontSize:12, color:'var(--text-2)', display:'flex', gap:6, alignItems:'center' }}>
                        <span style={{ fontWeight:500 }}>{p?.name}</span>
                        <span style={{ fontFamily:'monospace' }}>{b.bids_made}/{b.bids_attempted}</span>
                        <span style={{ color: Number(war)>=0?'var(--good)':'var(--bad)', fontFamily:'monospace', fontSize:11 }}>BidWAR {Number(war)>0?'+':''}{war}</span>
                      </div>;
                    })}
                  </div>
                )}
              </div>
              {error && <div style={{ padding:'10px 14px', background:'color-mix(in oklab, var(--bad) 10%, var(--surface))', border:'1px solid color-mix(in oklab, var(--bad) 25%, var(--border))', borderRadius:8, fontSize:13, color:'var(--bad)' }}>{error}</div>}
            </div>
          )}
        </div>

        <footer style={{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
          <Btn kind="bare" onClick={onClose}>Cancel</Btn>
          <div style={{ display:'flex', gap:8 }}>
            {step > 0 && <Btn kind="ghost" onClick={() => setStep(s=>s-1)}>← Back</Btn>}
            {step === 0 && <Btn kind="primary" onClick={() => setStep(1)}>Continue →</Btn>}
            {step === 1 && <Btn kind="primary" onClick={() => enterBidStep()}>Continue →</Btn>}
            {step === 2 && <Btn kind="primary" onClick={() => setStep(3)}>Continue →</Btn>}
            {step === 3 && <Btn kind="accent" onClick={handleSave} style={{ opacity:saving?0.6:1 }}>{saving?'Saving…':'Save match'}</Btn>}
          </div>
        </footer>
      </div>
    </div>
  );
}
