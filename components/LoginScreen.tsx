import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

/* ─── Paper slip ─── */
interface PaperProps {
  rotate: number;
  bg?: string;
  index?: number;
  children: React.ReactNode;
}

const Paper: React.FC<PaperProps> = ({ rotate, bg = '#ffffff', index = 0, children }) => (
  <div
    style={{
      position: 'absolute',
      top: 2 + index * 8,
      left: 14 + index * 18,
      right: 10 - index * 6,
      height: 92,
      background: bg,
      borderRadius: 4,
      padding: '10px 12px',
      boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
      transform: `rotate(${rotate}deg)`,
      transformOrigin: 'bottom center',
      zIndex: 1 + index,
      overflow: 'hidden',
      border: '0.5px solid rgba(0,0,0,0.06)',
    }}
  >
    {children}
  </div>
);

/* ─── Folder card ─── */
interface FolderCardProps {
  folderColor: string;
  tabColor: string;
  borderColor: string;
  dotColor: string;
  label: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folderColor, tabColor, borderColor, dotColor, label, title, description, children,
}) => (
  <div style={{ position: 'relative', paddingTop: 54 }}>
    {children}
    <div style={{ position: 'relative', zIndex: 10 }}>
      <div style={{
        position: 'absolute',
        top: -22,
        left: 0,
        width: 68,
        height: 24,
        background: tabColor,
        borderRadius: '6px 6px 0 0',
        border: `0.5px solid ${borderColor}`,
        borderBottom: 'none',
      }} />
      <div style={{
        background: folderColor,
        borderRadius: '0 8px 8px 8px',
        padding: '16px 16px 18px',
        border: `0.5px solid ${borderColor}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
          <span style={{
            fontSize: 8,
            fontFamily: 'monospace',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.2em',
            color: dotColor,
          }}>
            {label}
          </span>
        </div>
        <h3 style={{
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'monospace',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.06em',
          color: '#1a1a18',
          margin: '0 0 8px',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: 11,
          fontFamily: 'monospace',
          color: '#6a6860',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {description}
        </p>
      </div>
    </div>
  </div>
);

/* ─── Login screen ─── */
const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* LEFT */}
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
          <p style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.35em', color: '#b0ae9e', marginBottom: 16 }}>
            Observer Protocol 3.0
          </p>
          <h1 style={{ fontSize: 48, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em', color: '#1a1a18', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>
            Coherence
          </h1>
          <p style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 300, marginTop: 12 }}>
            <span style={{ color: '#b0ae9e' }}>Decisions drift.</span>{' '}
            <span style={{ fontWeight: 600, color: '#4a4840' }}>Anchors don't.</span>
          </p>
        </div>

        {/* 2×2 grid */}
        <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-7">

          {/* Commits */}
          <FolderCard
            folderColor="#cee8d2"
            tabColor="#96c99e"
            borderColor="#89ba92"
            dotColor="#2e7d32"
            label="Thread History"
            title="Commits"
            description="Log every thought. Each commit captures your reasoning at a moment in time."
          >
            <Paper rotate={-5} bg="#ffffff" index={0}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 7.5, fontFamily: 'monospace', color: '#b0ae9e' }}>02/05  14:22</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 7, fontFamily: 'monospace', fontWeight: 700, color: '#4caf50' }}>STABLE</span>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4caf50' }} />
                </div>
              </div>
              <p style={{ fontSize: 8.5, fontFamily: 'monospace', color: '#3a3a34', lineHeight: 1.6 }}>
                "Leaning towards the offer. The culture felt right and I've been stagnant here two years."
              </p>
            </Paper>
            <Paper rotate={4} bg="#f9fbe7" index={1}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 7.5, fontFamily: 'monospace', color: '#b0ae9e' }}>02/05  16:41</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 7, fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b' }}>DRIFTED</span>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b' }} />
                </div>
              </div>
              <p style={{ fontSize: 8.5, fontFamily: 'monospace', color: '#3a3a34', lineHeight: 1.6 }}>
                "Actually the pay cut is too steep. Can't justify it with rent going up."
              </p>
            </Paper>
          </FolderCard>

          {/* Anchors */}
          <FolderCard
            folderColor="#c8dff5"
            tabColor="#7eb5e8"
            borderColor="#6aa5dc"
            dotColor="#1565c0"
            label="Invariants"
            title="Anchors"
            description="Set principles that must never be violated. The Observer monitors every commit against them."
          >
            <Paper rotate={3} bg="#ffffff" index={0}>
              <p style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#b0ae9e', marginBottom: 8 }}>
                Anchors
              </p>
              <div style={{ borderLeft: '2px solid #e0e0e0', paddingLeft: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['Never decide out of fear', 'Must not cut take-home pay', 'Role must have growth path'].map((a, i) => (
                  <p key={i} style={{ fontSize: 8.5, fontFamily: 'monospace', color: '#3a3a34', lineHeight: 1.4, margin: 0 }}>{a}</p>
                ))}
              </div>
            </Paper>
          </FolderCard>

          {/* Drift Detection */}
          <FolderCard
            folderColor="#fde9a2"
            tabColor="#f5c832"
            borderColor="#e8b820"
            dotColor="#b45309"
            label="Observer"
            title="Drift Detection"
            description="The Observer flags when your latest thinking contradicts your own principles."
          >
            <Paper rotate={-4} bg="#fffef0" index={0}>
              <div style={{ borderLeft: '2px solid #f59e0b', paddingLeft: 10 }}>
                <p style={{ fontSize: 7.5, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#b45309', marginBottom: 6 }}>
                  Observer Note
                </p>
                <p style={{ fontSize: 8.5, fontFamily: 'monospace', color: '#92400e', lineHeight: 1.55, fontStyle: 'italic', margin: 0 }}>
                  "Reasoning is fear-driven — contradicts anchor: Never decide out of fear"
                </p>
              </div>
            </Paper>
          </FolderCard>

          {/* Evolution Map */}
          <FolderCard
            folderColor="#e2ccf0"
            tabColor="#b87fd0"
            borderColor="#a46dc0"
            dotColor="#6a1b9a"
            label="Thread Timeline"
            title="Evolution Map"
            description="Watch how your position evolves. Trace the exact moment your thinking shifted."
          >
            <Paper rotate={3} bg="#ffffff" index={0}>
              <p style={{ fontSize: 7.5, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#b0ae9e', marginBottom: 8 }}>
                Commit Index
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { label: 'Excited about the move', dot: '#9c27b0', status: 'STABLE' },
                  { label: 'Doubts creeping in', dot: '#f59e0b', status: 'DRIFTED' },
                  { label: 'Anchors revisited', dot: '#4caf50', status: 'STABLE' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, borderLeft: '2px solid transparent', paddingLeft: 2 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: row.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 8.5, fontFamily: 'monospace', color: '#3a3a34', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.label}
                    </span>
                  </div>
                ))}
              </div>
            </Paper>
          </FolderCard>

        </div>

        <p style={{ fontSize: 8, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#c0beb0' }}>
          Coherence — Reasoning System
        </p>
      </div>

      {/* RIGHT */}
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
              width: '100%',
              padding: '18px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              background: '#1a1a18',
              color: '#ffffff',
              fontFamily: 'monospace',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.4 : 1,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#000'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a1a18'; }}
          >
            {loading ? (
              <>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
                Redirecting...
              </>
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
