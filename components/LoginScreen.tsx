import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

/* ─── Small paper slip — fixed size, not full-width ─── */
interface PaperProps {
  x: number;
  y: number;
  rotate: number;
  rotateHover: number;
  dxHover?: number;
  dyHover?: number;
  bg?: string;
  hovered?: boolean;
  children: React.ReactNode;
}

const Paper: React.FC<PaperProps> = ({
  x, y, rotate, rotateHover, dxHover = 0, dyHover = -10,
  bg = '#fff', hovered = false, children,
}) => (
  <div style={{
    position: 'absolute',
    top: y,
    left: x,
    width: 148,
    height: 78,
    background: bg,
    borderRadius: 3,
    padding: '8px 10px',
    boxShadow: hovered ? '0 8px 20px rgba(0,0,0,0.16)' : '0 2px 8px rgba(0,0,0,0.10)',
    transform: hovered
      ? `rotate(${rotateHover}deg) translate(${dxHover}px,${dyHover}px)`
      : `rotate(${rotate}deg)`,
    transformOrigin: 'bottom center',
    transition: 'transform 0.35s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s ease',
    overflow: 'hidden',
    border: '0.5px solid rgba(0,0,0,0.08)',
    zIndex: 3,
  }}>
    {children}
  </div>
);

/* ─── Thread folder card ─── */
interface ThreadCardProps {
  folderColor: string;
  tabColor: string;
  borderColor: string;
  status: 'STABLE' | 'DRIFTED';
  threadName: string;
  commitCount: number;
  lastCommit: string;
  children: React.ReactNode;
}

const ThreadCard: React.FC<ThreadCardProps> = ({
  folderColor, tabColor, borderColor,
  status, threadName, commitCount, lastCommit, children,
}) => {
  const [hovered, setHovered] = useState(false);
  const statusColor = status === 'DRIFTED' ? '#b45309' : '#2e7d32';
  const statusDot   = status === 'DRIFTED' ? '#f59e0b' : '#4caf50';

  const childrenWithHover = React.Children.map(children, child =>
    React.isValidElement(child)
      ? React.cloneElement(child as React.ReactElement<any>, { hovered })
      : child
  );

  return (
    <div
      style={{ position: 'relative', paddingTop: 72, cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {childrenWithHover}

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Tab */}
        <div style={{
          position: 'absolute', top: -30, left: 0,
          width: 82, height: 32,
          background: tabColor,
          borderRadius: '7px 7px 0 0',
          border: `1px solid ${borderColor}`,
          borderBottom: 'none',
        }} />
        {/* Body */}
        <div style={{
          background: folderColor,
          borderRadius: '0 8px 8px 8px',
          padding: '14px 14px 15px',
          border: `1px solid ${borderColor}`,
          display: 'flex', flexDirection: 'column', gap: 8,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: hovered ? '0 8px 18px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
            <p style={{
              fontSize: 10.5, fontFamily: 'monospace', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              color: '#1a1a18', margin: 0, lineHeight: 1.3,
            }}>
              {threadName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 7, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: statusColor }}>
                {status}
              </span>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: statusDot }} />
            </div>
          </div>

          <p style={{
            fontSize: 9.5, fontFamily: 'monospace', color: '#6a6860',
            lineHeight: 1.5, margin: 0, fontStyle: 'italic',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>
            "{lastCommit}"
          </p>

          <p style={{
            fontSize: 7.5, fontFamily: 'monospace', color: '#b0ae9e',
            textTransform: 'uppercase', letterSpacing: '0.15em',
            margin: 0, borderTop: `0.5px solid ${borderColor}`, paddingTop: 8,
          }}>
            {commitCount} commits
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── Shared paper text styles ─── */
const pt = (size = 8): React.CSSProperties => ({
  fontSize: size, fontFamily: 'monospace', color: '#3a3a34', lineHeight: 1.5, margin: 0,
});
const muted: React.CSSProperties = { fontSize: 7, fontFamily: 'monospace', color: '#b0ae9e' };
const plabel: React.CSSProperties = {
  fontSize: 6.5, fontFamily: 'monospace', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.2em', color: '#b0ae9e', marginBottom: 5,
};

/* ─── Login screen ─── */
const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT ── */}
      <div
        className="flex-1 flex flex-col justify-center p-10 lg:p-16 gap-14"
        style={{
          background: '#f0ede8',
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        {/* Brand */}
        <div>
          <h1 style={{ fontSize: 44, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em', color: '#1a1a18', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>
            Coherence
          </h1>
          <p style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#4a4840', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Version control for your thinking
          </p>
        </div>

        {/* 2×2 thread grid — capped so cards stay folder-proportioned */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, maxWidth: 580 }}>

          {/* 1 — CLIENT SCOPE */}
          <ThreadCard
            folderColor="#bde4ec" tabColor="#5aaec0" borderColor="#4a9eb0"
            status="DRIFTED" threadName="Client_Scope_Q2" commitCount={7}
            lastCommit="Rebuilt the dashboard. It's cleaner. They didn't ask for it."
          >
            <Paper x={18} y={8} rotate={-6} rotateHover={-18} dyHover={-14} bg="#f0fbfd">
              <p style={plabel}>Observer Note</p>
              <p style={{ ...pt(), color: '#92400e', fontStyle: 'italic' }}>
                "'Just a quick addition' — 4 of 7 commits. Anchor violated.
              </p>
            </Paper>
            <Paper x={52} y={14} rotate={5} rotateHover={16} dxHover={8} dyHover={-8} bg="#fff">
              <span style={muted}>04/05 · 10:22 · DRIFTED</span>
              <p style={{ ...pt(), marginTop: 4 }}>No out-of-scope work without written approval.</p>
            </Paper>
          </ThreadCard>

          {/* 2 — NEET GAP YEAR */}
          <ThreadCard
            folderColor="#fde9a2" tabColor="#e8b820" borderColor="#d4a810"
            status="DRIFTED" threadName="NEET_2026" commitCount={14}
            lastCommit="Physics done. Skipped chem. YouTube was open the whole time."
          >
            <Paper x={16} y={8} rotate={-5} rotateHover={-17} dyHover={-14} bg="#fffef0">
              <p style={plabel}>Commit Index</p>
              {[
                { text: '6h — actually did it', dot: '#4caf50' },
                { text: "Skipped. 'Catch up'",  dot: '#f59e0b' },
                { text: 'Skipped again',          dot: '#ef4444' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: r.dot, flexShrink: 0 }} />
                  <span style={pt(7.5)}>{r.text}</span>
                </div>
              ))}
            </Paper>
            <Paper x={50} y={15} rotate={5} rotateHover={15} dxHover={6} dyHover={-8} bg="#fff">
              <span style={muted}>01/05 · 08:00 · DRIFTED</span>
              <p style={{ ...pt(), marginTop: 4 }}>Anchor: 6h minimum. No phones until 6 PM.</p>
            </Paper>
          </ThreadCard>

          {/* 3 — GO FREELANCE */}
          <ThreadCard
            folderColor="#cee8d2" tabColor="#7ab882" borderColor="#6aaa72"
            status="STABLE" threadName="Go_Freelance" commitCount={9}
            lastCommit="Declined the Google offer. Runway: 4 months. Terrifying. Staying."
          >
            <Paper x={16} y={8} rotate={-5} rotateHover={-16} dyHover={-14} bg="#f0faf2">
              <p style={plabel}>Anchors</p>
              <div style={{ borderLeft: '2px solid #7ab882', paddingLeft: 6 }}>
                <p style={{ ...pt(7.5), marginBottom: 3 }}>No full-time offers</p>
                <p style={{ ...pt(7.5), marginBottom: 3 }}>Validate before building</p>
                <p style={pt(7.5)}>First client by month 2</p>
              </div>
            </Paper>
            <Paper x={50} y={15} rotate={4} rotateHover={13} dxHover={6} dyHover={-8} bg="#fff">
              <span style={muted}>30/04 · 21:14 · STABLE</span>
              <p style={{ ...pt(), marginTop: 4 }}>Offer declined. Anchor held. Runway above threshold.</p>
            </Paper>
          </ThreadCard>

          {/* 4 — LEAVE THE COUNTRY */}
          <ThreadCard
            folderColor="#e2ccf0" tabColor="#a46dc0" borderColor="#9460b0"
            status="STABLE" threadName="Leave_The_Country" commitCount={8}
            lastCommit="Found a flat in Berlin. Didn't tell anyone yet. Timeline holding."
          >
            <Paper x={16} y={8} rotate={-4} rotateHover={-15} dyHover={-14} bg="#faf5ff">
              <p style={plabel}>Anchors</p>
              <div style={{ borderLeft: '2px solid #a46dc0', paddingLeft: 6 }}>
                <p style={{ ...pt(7.5), marginBottom: 3 }}>Relocate by December</p>
                <p style={{ ...pt(7.5), marginBottom: 3 }}>Don't let guilt shift the date</p>
                <p style={pt(7.5)}>Role lined up before moving</p>
              </div>
            </Paper>
            <Paper x={50} y={15} rotate={5} rotateHover={15} dxHover={6} dyHover={-8} bg="#fff">
              <span style={muted}>01/04 · 22:11 · STABLE</span>
              <p style={{ ...pt(), marginTop: 4 }}>Berlin flat found. Timeline consistent. Anchor intact.</p>
            </Paper>
          </ThreadCard>

        </div>
      </div>

      {/* ── RIGHT ── */}
      <div
        className="w-full lg:w-[360px] shrink-0 flex flex-col justify-center p-10 lg:p-14"
        style={{ background: '#faf9f6', borderLeft: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.35em', color: '#c0beb0', margin: 0 }}>
              Your threads are waiting
            </p>
            <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#1a1a18', lineHeight: 1.25, margin: 0 }}>
              Sign in to access your archive.
            </h2>
            <p style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#908e7e', lineHeight: 1.7, margin: 0 }}>
              Your reasoning history is private. Only you can read it.
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px 14px', border: '1px solid #fca5a5', background: '#fef2f2', fontSize: 11, fontFamily: 'monospace', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%', padding: '16px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: '#1a1a18', color: '#fff',
              fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.2em',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.4 : 1, transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#000'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a1a18'; }}
          >
            {loading ? (
              <><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block' }} /> Redirecting...</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
