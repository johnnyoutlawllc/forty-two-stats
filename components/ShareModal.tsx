'use client';
import { useState, useEffect, useCallback } from 'react';
import { Btn, Pill, Avatar } from './ui';
import { getShares, shareLeague, unshareLeague, renameLeague } from '@/lib/leagues';
import type { League, LeagueShare } from '@/lib/types';

const IS: React.CSSProperties = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontFamily:'inherit', fontSize:14, color:'var(--text)', width:'100%' };
function Lbl({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-2)', fontWeight:500, marginBottom:6 }}>{children}</div>;
}

export function ShareModal({ league, onClose, onChanged }: {
  league: League; onClose: () => void; onChanged: () => void;
}) {
  const [shares, setShares]   = useState<LeagueShare[]>([]);
  const [email, setEmail]     = useState('');
  const [role, setRole]       = useState<'viewer'|'editor'>('viewer');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState('');
  const [notice, setNotice]   = useState('');
  const [name, setName]       = useState(league.name);
  const [renaming, setRenaming] = useState(false);

  const isOwner = league.role === 'owner';

  const load = useCallback(() => {
    getShares(league.id).then(setShares).catch(e => setError(e.message));
  }, [league.id]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!email.trim()) { setError('Enter an email address.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await shareLeague(league.id, email.trim(), role);
      setNotice(result === 'added'
        ? `${email.trim()} can see these stats now.`
        : `${email.trim()} has no account yet. They will get access the first time they sign in with that address.`);
      setEmail('');
      load(); onChanged();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Could not share.'); }
    finally { setBusy(false); }
  };

  const remove = async (addr: string) => {
    setBusy(true); setError(''); setNotice('');
    try { await unshareLeague(league.id, addr); load(); onChanged(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Could not remove.'); }
    finally { setBusy(false); }
  };

  const doRename = async () => {
    if (!name.trim() || name.trim() === league.name) { setRenaming(false); return; }
    setBusy(true); setError('');
    try { await renameLeague(league.id, name.trim()); setRenaming(false); onChanged(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Could not rename.'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(20,18,14,0.45)', zIndex:100, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'50px 20px', overflowY:'auto' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'var(--surface)', borderRadius:14, width:'min(540px,100%)', boxShadow:'0 24px 60px rgba(0,0,0,0.2)', border:'1px solid var(--border)', overflow:'hidden' }}>

        <header style={{ padding:'16px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ margin:0, fontSize:16, fontWeight:600 }}>Share these stats</h2>
            <div style={{ marginTop:3, fontSize:12, color:'var(--text-2)' }}>{league.name}</div>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:22, color:'var(--text-2)', padding:4, lineHeight:1 }}>×</button>
        </header>

        <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:18 }}>

          {isOwner ? (
            <>
              <div>
                <Lbl>League name</Lbl>
                {renaming ? (
                  <div style={{ display:'flex', gap:8 }}>
                    <input value={name} onChange={e=>setName(e.target.value)} style={IS} autoFocus
                           onKeyDown={e => e.key === 'Enter' && doRename()} />
                    <Btn kind="primary" onClick={doRename}>Save</Btn>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:14 }}>{league.name}</span>
                    <Btn kind="bare" onClick={() => setRenaming(true)}>Rename</Btn>
                  </div>
                )}
              </div>

              <div>
                <Lbl>Invite by email</Lbl>
                <p style={{ margin:'0 0 10px', fontSize:12.5, color:'var(--text-2)', lineHeight:1.5 }}>
                  They sign in with Google using this address. If they do not have an account yet,
                  access waits for them until they do.
                </p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                         placeholder="grandma@example.com" style={{ ...IS, flex:1, minWidth:180 }}
                         onKeyDown={e => e.key === 'Enter' && !busy && add()} />
                  <select value={role} onChange={e=>setRole(e.target.value as 'viewer'|'editor')}
                          style={{ ...IS, width:'auto', cursor:'pointer' }}>
                    <option value="viewer">Can view</option>
                    <option value="editor">Can record</option>
                  </select>
                  <Btn kind="accent" onClick={add} style={{ opacity: busy ? 0.6 : 1 }}>
                    {busy ? 'Sharing…' : 'Share'}
                  </Btn>
                </div>
              </div>
            </>
          ) : (
            <p style={{ margin:0, fontSize:13, color:'var(--text-2)', lineHeight:1.55 }}>
              {league.owner_name ?? 'The owner'} shared these stats with you as
              {' '}<strong>{league.role === 'editor' ? 'an editor' : 'a viewer'}</strong>.
              Only the owner can change who has access.
            </p>
          )}

          {notice && <div style={{ padding:'10px 13px', background:'color-mix(in oklab, var(--good) 10%, var(--surface))', border:'1px solid color-mix(in oklab, var(--good) 25%, var(--border))', borderRadius:8, fontSize:12.5, color:'color-mix(in oklab, var(--good) 75%, var(--text))', lineHeight:1.5 }}>{notice}</div>}
          {error  && <div style={{ padding:'10px 13px', background:'color-mix(in oklab, var(--bad) 10%, var(--surface))', border:'1px solid color-mix(in oklab, var(--bad) 25%, var(--border))', borderRadius:8, fontSize:12.5, color:'var(--bad)' }}>{error}</div>}

          <div>
            <Lbl>Who has access</Lbl>
            <div style={{ border:'1px solid var(--border)', borderRadius:9, overflow:'hidden' }}>
              {shares.length === 0 && (
                <div style={{ padding:'14px 15px', fontSize:13, color:'var(--text-3)' }}>Just you so far.</div>
              )}
              {shares.map(s => (
                <div key={`${s.status}-${s.email}`} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                  <Avatar name={s.display_name || s.email} color={s.role === 'owner' ? '#c2532b' : '#5b6770'} size="md2" />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {s.display_name || s.email}
                    </div>
                    <div style={{ fontSize:11.5, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.email}</div>
                  </div>
                  <Pill tone={s.role === 'owner' ? 'accent' : 'muted'} size="sm">
                    {s.role === 'owner' ? 'Owner' : s.role === 'editor' ? 'Can record' : 'Can view'}
                  </Pill>
                  {s.status === 'pending' && <Pill tone="neutral" size="sm">Pending</Pill>}
                  {isOwner && s.role !== 'owner' && (
                    <button onClick={() => remove(s.email)} title="Remove access"
                            style={{ background:'transparent', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:19, padding:'0 2px', lineHeight:1 }}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer style={{ padding:'13px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end' }}>
          <Btn kind="ghost" onClick={onClose}>Done</Btn>
        </footer>
      </div>
    </div>
  );
}
