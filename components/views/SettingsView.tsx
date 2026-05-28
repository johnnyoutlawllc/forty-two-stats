'use client';
import { useState } from 'react';
import { Card, Avatar, Pill, Btn, Th } from '../ui';
import { addPlayer, updatePlayer } from '@/lib/data';
import { fmtPct } from '@/lib/utils';
import type { PlayerStats } from '@/lib/types';

const COLORS = ['#c2532b','#2e6e57','#3a5a8a','#8a4f9c','#b08d2e','#5b6770','#7a4a2e','#5d8a4c','#9c6b3a','#c4687a'];
const IS: React.CSSProperties = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontFamily:'inherit', fontSize:14, color:'var(--text)', width:'100%' };

export function SettingsView({ players, onNav, onRefresh }: { players: PlayerStats[]; onNav: (n:string,p?:string)=>void; onRefresh: ()=>void }) {
  const [showArchived, setShowArchived] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PlayerStats | null>(null);

  const visible = players.filter(p => showArchived || !p.archived);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <header style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:600, margin:0 }}>Players</h1>
          <p style={{ margin:'2px 0 0', color:'var(--text-2)', fontSize:13 }}>Manage players. Linking Google accounts comes when auth is wired up.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Btn kind="ghost" onClick={() => setShowArchived(v=>!v)}>{showArchived ? 'Hide archived' : 'Show archived'}</Btn>
          <Btn kind="primary" icon="+" onClick={() => setAdding(true)}>Add player</Btn>
        </div>
      </header>

      <Card padded={false}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr>
              <Th>Player</Th>
              <Th align="right" width={90}>Record</Th>
              <Th>Email</Th>
              <Th align="right" width={140}> </Th>
            </tr>
          </thead>
          <tbody>
            {visible.map(p => (
              <tr key={p.id} style={{ borderTop:'1px solid var(--border)', opacity: p.archived ? 0.5 : 1 }}>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <Avatar name={p.name} color={p.color} size="md2" />
                    <div>
                      <div style={{ fontWeight:500 }}>{p.name}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)' }}>
                        {p.joined_year ? `since ${p.joined_year}` : 'year unknown'}
                        {p.archived && <span style={{ marginLeft:8, color:'var(--bad)' }}>archived</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'12px 14px', textAlign:'right', fontFamily:'monospace', color:'var(--text-2)' }}>
                  {p.wins}–{p.losses}
                </td>
                <td style={{ padding:'12px 14px' }}>
                  {(p as any).email
                    ? <span style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-2)' }}>{(p as any).email}</span>
                    : <Pill tone="muted" size="sm">—</Pill>
                  }
                </td>
                <td style={{ padding:'12px 14px', textAlign:'right' }}>
                  <div style={{ display:'inline-flex', gap:6 }}>
                    <Btn kind="ghost" onClick={() => setEditing(p)}>Edit</Btn>
                    <Btn kind="bare" onClick={() => onNav('player', p.id)}>View →</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {adding && (
        <PlayerModal
          onClose={() => setAdding(false)}
          onSaved={() => { setAdding(false); onRefresh(); }}
        />
      )}
      {editing && (
        <PlayerModal
          player={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); onRefresh(); }}
        />
      )}
    </div>
  );
}

function PlayerModal({ player, onClose, onSaved }: { player?: PlayerStats; onClose: ()=>void; onSaved: ()=>void }) {
  const [name, setName]       = useState(player?.name ?? '');
  const [color, setColor]     = useState(player?.color ?? COLORS[0]);
  const [year, setYear]       = useState(player?.joined_year ? String(player.joined_year) : String(new Date().getFullYear()));
  const [email, setEmail]     = useState((player as any)?.email ?? '');
  const [archived, setArchived] = useState(player?.archived ?? false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const handle = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      const yr = year ? parseInt(year) : null;
      const em = email.trim() || null;
      if (player) {
        await updatePlayer(player.id, name.trim(), color, yr, em, archived);
      } else {
        await addPlayer(name.trim(), color, yr, em);
      }
      onSaved();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(20,18,14,0.45)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'var(--surface)', borderRadius:14, width:'min(460px,100%)', boxShadow:'0 24px 60px rgba(0,0,0,0.2)', border:'1px solid var(--border)', overflow:'hidden' }}>
        <header style={{ padding:'16px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:600 }}>{player ? 'Edit player' : 'Add player'}</h2>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:22, color:'var(--text-2)', padding:4, lineHeight:1 }}>×</button>
        </header>

        <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:16 }}>
          {/* Live preview */}
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'var(--surface-2)', borderRadius:10 }}>
            <Avatar name={name||'?'} color={color} size="xl" />
            <div>
              <div style={{ fontSize:18, fontWeight:600 }}>{name||<span style={{ color:'var(--text-3)' }}>Name</span>}</div>
              <div style={{ fontSize:12, color:'var(--text-2)', marginTop:2 }}>{year ? `since ${year}` : 'year unknown'}</div>
            </div>
          </div>

          <div>
            <label style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-2)', fontWeight:500, display:'block', marginBottom:6 }}>Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Player name" style={IS} autoFocus />
          </div>

          <div>
            <label style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-2)', fontWeight:500, display:'block', marginBottom:6 }}>Color</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{ width:32, height:32, borderRadius:'50%', background:c, border: color===c ? '3px solid var(--text)' : '3px solid transparent', cursor:'pointer', flexShrink:0, boxShadow: color===c ? '0 0 0 2px var(--surface), 0 0 0 4px var(--text)' : 'none' }} />
              ))}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-2)', fontWeight:500, display:'block', marginBottom:6 }}>Year joined</label>
              <input type="number" value={year} onChange={e=>setYear(e.target.value)} placeholder="2025" style={IS} />
            </div>
            <div>
              <label style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-2)', fontWeight:500, display:'block', marginBottom:6 }}>Email <span style={{ color:'var(--text-3)', textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="for future login" style={IS} />
            </div>
          </div>

          {player && (
            <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:13 }}>
              <input type="checkbox" checked={archived} onChange={e=>setArchived(e.target.checked)} />
              <span style={{ color: archived ? 'var(--bad)' : 'var(--text-2)' }}>Archived (hidden from active roster)</span>
            </label>
          )}

          {error && <div style={{ padding:'8px 12px', background:'color-mix(in oklab, var(--bad) 10%, var(--surface))', border:'1px solid color-mix(in oklab, var(--bad) 25%, var(--border))', borderRadius:8, fontSize:13, color:'var(--bad)' }}>{error}</div>}
        </div>

        <footer style={{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
          <Btn kind="bare" onClick={onClose}>Cancel</Btn>
          <Btn kind="accent" onClick={handle} style={{ opacity:saving?0.6:1 }}>{saving?'Saving…':(player?'Save changes':'Add player')}</Btn>
        </footer>
      </div>
    </div>
  );
}
