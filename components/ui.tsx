'use client';
import { useState, useEffect } from 'react';
import { initials } from '@/lib/utils';

// ── Avatar ────────────────────────────────────────────────────────────────
export function Avatar({ name, color, size = 'md' }: { name: string; color: string; size?: 'sm'|'md'|'md2'|'lg'|'xl' }) {
  const dim = { sm: 22, md: 28, md2: 34, lg: 48, xl: 72 }[size] ?? 28;
  const fs  = { sm: 10, md: 12, md2: 13, lg: 18, xl: 26 }[size] ?? 12;
  return (
    <span title={name} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: dim, height: dim, borderRadius: '50%', flexShrink: 0,
      background: `color-mix(in oklab, ${color} 22%, var(--surface))`,
      color: `color-mix(in oklab, ${color} 85%, var(--text))`,
      fontWeight: 600, fontSize: fs, letterSpacing: '0.02em',
      border: `1px solid color-mix(in oklab, ${color} 35%, var(--border))`,
    }}>{initials(name)}</span>
  );
}

// ── TeamLabel ─────────────────────────────────────────────────────────────
export function TeamLabel({ a, b, size = 'md', compact = false }: { a: {name:string;color:string}; b: {name:string;color:string}; size?: 'sm'|'md'|'lg'; compact?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-flex' }}>
        <Avatar name={a.name} color={a.color} size={size} />
        <span style={{ marginLeft: -8 }}><Avatar name={b.name} color={b.color} size={size} /></span>
      </span>
      {!compact && <span style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{a.name} / {b.name}</span>}
    </span>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────────
export function Pill({ tone = 'neutral', children, size = 'md', style }: { tone?: 'neutral'|'accent'|'good'|'bad'|'muted'; children: React.ReactNode; size?: 'sm'|'md'; style?: React.CSSProperties }) {
  const tones = {
    neutral: { bg: 'var(--surface-2)', fg: 'var(--text)', bd: 'var(--border)' },
    accent:  { bg: 'color-mix(in oklab, var(--accent) 14%, var(--surface))', fg: 'color-mix(in oklab, var(--accent) 85%, var(--text))', bd: 'color-mix(in oklab, var(--accent) 30%, var(--border))' },
    good:    { bg: 'color-mix(in oklab, var(--good) 12%, var(--surface))', fg: 'color-mix(in oklab, var(--good) 75%, var(--text))', bd: 'color-mix(in oklab, var(--good) 28%, var(--border))' },
    bad:     { bg: 'color-mix(in oklab, var(--bad) 12%, var(--surface))', fg: 'color-mix(in oklab, var(--bad) 80%, var(--text))', bd: 'color-mix(in oklab, var(--bad) 28%, var(--border))' },
    muted:   { bg: 'transparent', fg: 'var(--text-2)', bd: 'var(--border)' },
  };
  const t = tones[tone];
  const sz = size === 'sm' ? { fs: 11, py: 2, px: 7 } : { fs: 12, py: 3, px: 9 };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:`${sz.py}px ${sz.px}px`, borderRadius:999, border:`1px solid ${t.bd}`, background:t.bg, color:t.fg, fontSize:sz.fs, fontWeight:500, lineHeight:1.4, whiteSpace:'nowrap', ...style }}>{children}</span>
  );
}

// ── Btn ───────────────────────────────────────────────────────────────────
export function Btn({ kind = 'ghost', children, onClick, icon, style, ...rest }: { kind?: 'primary'|'accent'|'ghost'|'bare'; children?: React.ReactNode; onClick?: () => void; icon?: string; style?: React.CSSProperties; [k: string]: any }) {
  const s = { primary: { bg:'var(--text)', fg:'var(--surface)', bd:'var(--text)' }, accent:{ bg:'var(--accent)', fg:'#fff', bd:'var(--accent)' }, ghost:{ bg:'var(--surface)', fg:'var(--text)', bd:'var(--border)' }, bare:{ bg:'transparent', fg:'var(--text-2)', bd:'transparent' } }[kind];
  return (
    <button onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:6, background:s!.bg, color:s!.fg, border:`1px solid ${s!.bd}`, padding:'6px 12px', borderRadius:7, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', lineHeight:1.2, ...style }} {...rest}>
      {icon && <span style={{ fontSize:14 }}>{icon}</span>}{children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, title, action, padded = true, style }: { children: React.ReactNode; title?: string; action?: React.ReactNode; padded?: boolean; style?: React.CSSProperties }) {
  return (
    <section style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', ...style }}>
      {(title || action) && (
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ margin:0, fontSize:13, fontWeight:600, letterSpacing:'0.01em' }}>{title}</h3>
          {action}
        </header>
      )}
      <div style={padded ? { padding:16 } : undefined}>{children}</div>
    </section>
  );
}

// ── StatTile ──────────────────────────────────────────────────────────────
export function StatTile({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: 'accent' }) {
  return (
    <div style={{ background: tone === 'accent' ? 'color-mix(in oklab, var(--accent) 8%, var(--surface))' : 'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px' }}>
      <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-2)', fontWeight:500 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:600, marginTop:4, fontFamily:'var(--font-geist-mono, monospace)' }}>{value}</div>
      {hint && <div style={{ fontSize:12, color:'var(--text-2)', marginTop:2 }}>{hint}</div>}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────
export function Sparkline({ data, height = 22, width = 80, color = 'var(--text-2)', filled = false }: { data: number[]; height?: number; width?: number; color?: string; filled?: boolean }) {
  if (!data || data.length < 2) return <span style={{ color:'var(--text-3)', fontSize:11 }}>—</span>;
  const lo = Math.min(...data), hi = Math.max(...data), range = hi - lo || 1;
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * width).toFixed(1)},${(height - 2 - ((v - lo) / range) * (height - 4)).toFixed(1)}`).join(' ');
  const area = filled ? `0,${height} ${pts} ${width},${height}` : null;
  return (
    <svg width={width} height={height} style={{ display:'block' }}>
      {area && <polygon points={area} fill={color} opacity="0.15" />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── SplitBar ──────────────────────────────────────────────────────────────
export function SplitBar({ left, right, height = 6 }: { left: number; right: number; height?: number }) {
  const total = left + right;
  if (!total) return <div style={{ height, background:'var(--surface-2)', borderRadius:999 }} />;
  return (
    <div style={{ display:'flex', height, borderRadius:999, overflow:'hidden', background:'var(--surface-2)' }}>
      <div style={{ width:`${(left/total)*100}%`, background:'var(--accent)' }} />
      <div style={{ width:`${(right/total)*100}%`, background:'color-mix(in oklab, var(--text) 25%, var(--surface-2))' }} />
    </div>
  );
}

// ── FormDots ──────────────────────────────────────────────────────────────
export function FormDots({ form, max = 5 }: { form: ('W'|'L')[]; max?: number }) {
  return (
    <span style={{ display:'inline-flex', gap:3 }}>
      {form.slice(0, max).map((r, i) => (
        <span key={i} style={{ width:16, height:16, borderRadius:4, fontSize:10, fontWeight:600, display:'inline-flex', alignItems:'center', justifyContent:'center', background: r==='W' ? 'color-mix(in oklab, var(--good) 18%, var(--surface))' : 'color-mix(in oklab, var(--bad) 16%, var(--surface))', color: r==='W' ? 'color-mix(in oklab, var(--good) 75%, var(--text))' : 'color-mix(in oklab, var(--bad) 80%, var(--text))', border:'1px solid var(--border)' }}>{r}</span>
      ))}
    </span>
  );
}

// ── Th (sortable header) ──────────────────────────────────────────────────
export function Th({ children, sortKey, sort, setSort, align = 'left', width, hideOnMobile }: { children?: React.ReactNode; sortKey?: string; sort?: {key:string;dir:'asc'|'desc'}; setSort?: (fn: (p: any) => any) => void; align?: string; width?: number; hideOnMobile?: boolean }) {
  const active = sortKey && sort?.key === sortKey;
  return (
    <th style={{ textAlign: align as any, padding:'10px 12px', fontSize:11, fontWeight:500, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--text-2)', borderBottom:'1px solid var(--border)', cursor: sortKey ? 'pointer' : 'default', width, userSelect:'none', display: hideOnMobile ? undefined : undefined }}
      onClick={() => sortKey && setSort && setSort(prev => ({ key: sortKey, dir: prev.key === sortKey && prev.dir === 'desc' ? 'asc' : 'desc' }))}>
      {children}{active && <span style={{ marginLeft:4, color:'var(--text)' }}>{sort!.dir === 'desc' ? '↓' : '↑'}</span>}
    </th>
  );
}

// ── useIsMobile ───────────────────────────────────────────────────────────
export function useIsMobile(bp = 760) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const check = () => setM(window.innerWidth < bp);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [bp]);
  return m;
}
