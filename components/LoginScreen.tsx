import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

/* ─── Rotating ticker ─── */
const USE_CASES = [
  "The scope that keeps expanding beyond the brief.",
  "The exam you're preparing for — or avoiding.",
  "The startup idea you're scared to bet on.",
  "The country you keep putting on hold.",
  "The client who doesn't know you've gone rogue.",
  "The gap year that's slipping away.",
];

const UseCaseTicker: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIndex(i => (i + 1) % USE_CASES.length); setVisible(true); }, 380);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <p style={{
      fontSize: 12, fontFamily: 'monospace', color: '#908e7e', marginTop: 8,
      fontStyle: 'italic', transition: 'opacity 0.38s ease',
      opacity: visible ? 1 : 0, minHeight: 20,
    }}>
      {USE_CASES[index]}
    </p>
  );
};

/* ─── Paper slip ─── */
interface PaperProps {
  rotate: number;
  bg?: string;
  index?: number;
  children: React.ReactNode;
}

const Paper: React.FC<PaperProps> = ({ rotate, bg = '#fff', index = 0, children }) => (
  <div style={{
    position: 'absolute',
    top: 2 + index * 8,
    left: 14 + index * 18,
    right: 10 - index * 6,
    height: 94,
    background: bg,
    borderRadius: 4,
    padding: '10px 12px',
    boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
    transform: `rotate(${rotate}deg)`,
    transformOrigin: 'bottom center',
    zIndex: 1 + index,
    overflow: 'hidden',
    border: '0.5px solid rgba(0,0,0,0.07)',
  }}>
    {children}
  </div>
);

/* ─── Thread folder card ─── */
interface ThreadCardProps {
  folderColor: string;
  tabColor: string;
  borderColor: string;
  dotColor: string;
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
  const statusColor = status === 'DRIFTED' ? '#b45309' : '#2e7d32';
  const statusDot   = status === 'DRIFTED' ? '#f59e0b' : '#4caf50';

  return (
    <div style={{ position: 'relative', paddingTop: 54 }}>
      {children}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Tab */}
        <div style={{
          position: 'absolute', top: -22, left: 0,
          width: 68, height: 24,
          background: tabColor,
          borderRadius: '6px 6px 0 0',
          border: `0.5px solid ${borderColor}`,
          borderBottom: 'none',
        }} />
        {/* Body */}
        <div style={{
          background: folderColor,
          borderRadius: '0 8px 8px 8px',
          padding: '14px 14px 16px',
          border: `0.5px solid ${borderColor}`,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* Thread name + status */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <p style={{
              fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              color: '#1a1a18', margin: 0, lineHeight: 1.3,
            }}>
              {threadName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <span style={{
                fontSize: 7, fontFamily: 'monospace', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.15em',
                color: statusColor,
              }}>
                {status}
              </span>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: statusDot }} />
            </div>
          </div>

          {/* Latest commit */}
          <p style={{
            fontSize: 10, fontFamily: 'monospace', color: '#6a6860',
            lineHeight: 1.55, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
            fontStyle: 'italic',
          }}>
            "{lastCommit}"
          </p>

          {/* Footer */}
          <p style={{
            fontSize: 8, fontFamily: 'monospace', color: '#b0ae9e',
            textTransform: 'uppercase', letterSpacing: '0.15em',
            margin: 0, borderTop: `0.5px solid ${borderColor}`, paddingTop: 8,
          }}>
            {commitCount} commits in thread
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── Shared paper text styles ─── */
const pt = (size = 8.5): React.CSSProperties => ({
  fontSize: size, fontFamily: 'monospace', color: '#3a3a34', lineHeight: 1.55, margin: 0,
});
const muted: React.CSSProperties = { fontSize: 7.5, fontFamily: 'monospace', color: '#b0ae9e' };
const label: React.CSSProperties = {
  fontSize: 7, fontFamily: 'monospace', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.2em', color: '#b0ae9e', marginBottom: 6,
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
        className="flex-1 flex flex-col justify-between p-10 lg:p-14"
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
          <p style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.35em', color: '#b0ae9e', marginBottom: 14 }}>
            Observer Protocol 3.0
          </p>
          <h1 style={{ fontSize: 48, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em', color: '#1a1a18', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>
            Coherence
          </h1>
          <p style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: '#4a4840', marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Version control for your thinking
          </p>
          <UseCaseTicker />
        </div>

        {/* 2×2 thread grid */}
        <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-7">

          {/* 1 — CLIENT SCOPE (software engineer) */}
          <ThreadCard
            folderColor="#bde4ec" tabColor="#6dbdce" borderColor="#5aaec0" dotColor="#b45309"
            status="DRIFTED"
            threadName="Client_Scope_Q2"
            commitCount={7}
            lastCommit="Rebuilt the dashboard. It's cleaner. They didn't ask for it."
          >
            <Paper rotate={-4} bg="#f0fbfd" index={0}>
              <div style={{ borderLeft: '2px solid #f59e0b', paddingLeft: 10 }}>
                <p style={{ ...label, color: '#b45309' }}>Observer Note</p>
                <p style={{ ...pt(8.5), color: '#92400e', fontStyle: 'italic' }}>
                  "'Just a quick addition' appears in 4 of 7 commits. Anchor: no out-of-scope work without written approval."
                </p>
              </div>
            </Paper>
          </ThreadCard>

          {/* 2 — GAP YEAR / NEET */}
          <ThreadCard
            folderColor="#fde9a2" tabColor="#f5c832" borderColor="#e8b820" dotColor="#b45309"
            status="DRIFTED"
            threadName="NEET_2026"
            commitCount={14}
            lastCommit="Physics done. Skipped chem. YouTube was open the whole time."
          >
            <Paper rotate={3} bg="#fffef0" index={0}>
              <p style={label}>Commit Index</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { text: '6h study — actually did it', dot: '#4caf50' },
                  { text: "Skipped. 'Will catch up'",   dot: '#f59e0b' },
                  { text: 'Skipped again',               dot: '#ef4444' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: row.dot, flexShrink: 0 }} />
                    <span style={{ ...pt(8.5), color: '#4a4840' }}>{row.text}</span>
                  </div>
                ))}
              </div>
            </Paper>
          </ThreadCard>

          {/* 3 — GO FREELANCE / BUILD STARTUP */}
          <ThreadCard
            folderColor="#cee8d2" tabColor="#96c99e" borderColor="#89ba92" dotColor="#2e7d32"
            status="STABLE"
            threadName="Go_Freelance"
            commitCount={9}
            lastCommit="Declined the Google offer. Runway: 4 months. Terrifying. Staying."
          >
            <Paper rotate={-3} bg="#f0faf2" index={0}>
              <p style={label}>Anchors</p>
              <div style={{ borderLeft: '2px solid #96c99e', paddingLeft: 9, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <p style={pt()}>No full-time offers, even good ones</p>
                <p style={pt()}>Validate before building</p>
                <p style={pt()}>First client by month 2</p>
              </div>
            </Paper>
          </ThreadCard>

          {/* 4 — MOVE OUT / CHANGE COUNTRIES */}
          <ThreadCard
            folderColor="#e2ccf0" tabColor="#b87fd0" borderColor="#a46dc0" dotColor="#6a1b9a"
            status="STABLE"
            threadName="Leave_The_Country"
            commitCount={8}
            lastCommit="Found a flat in Berlin. Didn't tell anyone yet. Timeline holding."
          >
            <Paper rotate={4} bg="#faf5ff" index={0}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={muted}>01/04 · 22:11</span>
                <span style={{ ...muted, color: '#4caf50', fontWeight: 700 }}>STABLE</span>
              </div>
              <p style={pt()}>
                "Target: relocate by December. Anchor: don't let guilt change the timeline. Still on track."
              </p>
            </Paper>
          </ThreadCard>

        </div>

        <p style={{ fontSize: 8, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#c0beb0' }}>
          Coherence — Reasoning System
        </p>
      </div>

      {/* ── RIGHT ── */}
      <div
        className="w-full lg:w-[380px] shrink-0 flex flex-col justify-center p-10 lg:p-14"
        style={{ background: '#faf9f6', borderLeft: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.35em', color: '#c0beb0', margin: 0 }}>
              Your threads are waiting
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#1a1a18', lineHeight: 1.25, margin: 0 }}>
              Sign in to access your archive.
            </h2>
            <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#908e7e', lineHeight: 1.7, margin: 0 }}>
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
              width: '100%', padding: '18px 0',
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

          <p style={{ fontSize: 8, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#d0cec8', margin: 0 }}>
            Auth Required // v3.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
