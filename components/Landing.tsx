'use client';
import { Btn } from './ui';
import { useIsMobile } from './ui';

export function Landing({ onSignIn, onDemo }: { onSignIn: () => void; onDemo: () => void }) {
  const isMobile = useIsMobile();

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding: isMobile ? '40px 20px' : '60px 24px' }}>
      <div style={{ width:'min(620px, 100%)' }}>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          <img src="/icon.svg" alt="" width={44} height={44} style={{ borderRadius:10 }} />
          <div>
            <div style={{ fontSize:20, fontWeight:600, letterSpacing:'-0.02em' }}>42 stats</div>
            <div style={{ fontSize:12.5, color:'var(--text-2)' }}>family edition</div>
          </div>
        </div>

        <h1 style={{ fontSize: isMobile ? 27 : 34, fontWeight:600, letterSpacing:'-0.025em', lineHeight:1.15, margin:'0 0 16px' }}>
          Keep score of your family&rsquo;s 42 games.
        </h1>

        <p style={{ fontSize:16, lineHeight:1.6, color:'var(--text-2)', margin:'0 0 14px' }}>
          A private logbook for the domino game. Record who played, who won, and how the
          bidding went, and the standings, head-to-head records and player profiles build
          themselves over time.
        </p>

        <p style={{ fontSize:16, lineHeight:1.6, color:'var(--text-2)', margin:'0 0 28px' }}>
          Sign in with Google to save your games. Your stats are yours and nobody else can
          see them until you share them. Invite your family by email so everyone can
          follow along. It is free, and it is built for families.
        </p>

        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:30 }}>
          <Btn kind="accent" onClick={onSignIn} style={{ padding:'11px 18px', fontSize:14.5, borderRadius:9 }}>
            <GoogleMark /> Sign in with Google
          </Btn>
          <Btn kind="ghost" onClick={onDemo} style={{ padding:'11px 18px', fontSize:14.5, borderRadius:9 }}>
            Look around the demo first
          </Btn>
        </div>

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap:12, marginBottom:26 }}>
          <Point title="Private by default" body="Nobody sees your games unless you invite them. Signed-out visitors only ever see the sample league." />
          <Point title="Share with family" body="Invite by email as a viewer who can follow along, or an editor who can record match nights too." />
          <Point title="Stats that add up" body="Standings, head-to-head, recent form, partner records and BidWAR, all from the scores you enter." />
        </div>

        <div style={{ display:'grid', gap:16, marginBottom:26 }}>
          <Shot src="/screenshots/home.png" alt="The 42 stats home dashboard showing standings, recent matches and activity"
            caption="The dashboard builds itself from the matches you record." />
          <Shot src="/screenshots/player.png" alt="A player profile with win percentage over time, best partners and recent matches"
            caption="Every player gets a profile: form, best partners, and win percentage over time." />
          <Shot src="/screenshots/h2h.png" alt="Head-to-head comparison between two players with series record and match list"
            caption="Head-to-head settles the family arguments with the actual record." />
        </div>

        <p style={{ fontSize:12.5, color:'var(--text-3)', margin:0, lineHeight:1.6 }}>
          Free to use. We store your email address and the games you record, nothing else.
        </p>
      </div>
    </div>
  );
}

function Shot({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure style={{ margin:0 }}>
      <img src={src} alt={alt} loading="lazy"
        style={{ width:'100%', display:'block', borderRadius:10, border:'1px solid var(--border)' }} />
      <figcaption style={{ fontSize:12.5, color:'var(--text-2)', marginTop:7, lineHeight:1.5 }}>
        {caption}
      </figcaption>
    </figure>
  );
}

function Point({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'13px 15px' }}>
      <div style={{ fontSize:13, fontWeight:600, marginBottom:5 }}>{title}</div>
      <div style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.5 }}>{body}</div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48" style={{ flexShrink:0, background:'#fff', borderRadius:2, padding:1 }}>
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.3z"/>
      <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.1H4.3v5.7C7.9 41.1 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.6 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.3C2.8 17 2 20.4 2 24s.8 7 2.3 9.9l7.3-5.7z"/>
      <path fill="#EA4335" d="M24 10.7c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 4.1 30 2 24 2 15.4 2 7.9 6.9 4.3 14.1l7.3 5.7c1.7-5.2 6.6-9.1 12.4-9.1z"/>
    </svg>
  );
}
