import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

/* ─── Paper slip inside each folder ─── */
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
      top: 2 + index * 6,
      left: 18 + index * 20,
      right: 14 - index * 6,
      height: 90,
      background: bg,
      borderRadius: 4,
      padding: '10px 12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
      transform: `rotate(${rotate}deg)`,
      transformOrigin: 'bottom center',
      zIndex: 1 + index,
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

/* ─── macOS-style folder card ─── */
interface FolderCardProps {
  folderColor: string;
  tabColor: string;
  dotColor: string;
  label: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folderColor,
  tabColor,
  dotColor,
  label,
  title,
  description,
  children,
}) => (
  <div style={{ position: 'relative', paddingTop: 52 }}>
    {/* Papers peeking above the folder */}
    {children}

    {/* Folder shape */}
    <div style={{ position: 'relative', zIndex: 10 }}>
      {/* Tab */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          left: 0,
          width: 64,
          height: 22,
          background: tabColor,
          borderRadius: '6px 6px 0 0',
        }}
      />
      {/* Body */}
      <div
        style={{
          background: folderColor,
          borderRadius: '0 10px 10px 10px',
          padding: '18px 16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: dotColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 7,
              fontFamily: 'monospace',
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.2em',
              color: dotColor,
            }}
          >
            {label}
          </span>
        </div>

        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'monospace',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.06em',
            color: '#2a2a24',
            margin: '0 0 8px',
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: 11,
            fontFamily: 'monospace',
            color: '#a09e90',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  </div>
);

/* ─── Main login screen ─── */
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

      {/* ── LEFT — feature showcase ── */}
      <div
        className="flex-1 flex flex-col justify-between p-12 lg:p-16"
        style={{
          background: '#f0ede8',
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      >
        {/* Brand */}
        <div>
          <p
            style={{
              fontSize: 8,
              fontFamily: 'monospace',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.35em',
              color: '#c0beb0',
              marginBottom: 20,
            }}
          >
            Observer Protocol 3.0
          </p>
          <h1
            style={{
              fontSize: 52,
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              color: '#2a2a24',
              textTransform: 'uppercase',
              lineHeight: 1,
              margin: 0,
            }}
          >
            Coherence
          </h1>
          <p
            style={{
              fontSize: 14,
              fontFamily: 'monospace',
              fontWeight: 300,
              marginTop: 14,
            }}
          >
            <span style={{ color: '#c0beb0' }}>Decisions drift.</span>{' '}
            <span style={{ fontWeight: 600, color: '#7a786a' }}>Anchors don't.</span>
          </p>
        </div>

        {/* 2×2 folder grid */}
        <div className="my-12 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">

          {/* 1 — Commits */}
          <FolderCard
            folderColor="#e8f5e9"
            tabColor="#c8e6c9"
            dotColor="#4caf50"
            label="Thread History"
            title="Commits"
            description="Log every thought. Each commit captures your reasoning at a moment in time."
          >
            <Paper rotate={-6} bg="#ffffff" index={0}>
              <p style={{ fontSize: 8, fontFamily: 'monospace', color: '#6a6860', lineHeight: 1.6 }}>
                "Leaning towards the offer. The culture felt right and I've been stagnant here for two years."
              </p>
            </Paper>
            <Paper rotate={4} bg="#f9fbe7" index={1}>
              <p style={{ fontSize: 8, fontFamily: 'monospace', color: '#6a6860', lineHeight: 1.6 }}>
                "Actually the pay cut is too steep. Can't justify it with rent going up."
              </p>
            </Paper>
          </FolderCard>

          {/* 2 — Anchors */}
          <FolderCard
            folderColor="#e3f2fd"
            tabColor="#bbdefb"
            dotColor="#2196f3"
            label="Invariants"
            title="Anchors"
            description="Set principles that must never be violated. The Observer monitors every commit against them."
          >
            <Paper rotate={3} bg="#ffffff" index={0}>
              <p
                style={{
                  fontSize: 8,
                  fontFamily: 'monospace',
                  color: '#37474f',
                  lineHeight: 1.9,
                  whiteSpace: 'pre-line',
                }}
              >
                {'⚓  Never decide out of fear\n⚓  Must not cut take-home pay\n⚓  Role must have a growth path'}
              </p>
            </Paper>
          </FolderCard>

          {/* 3 — Drift Detection */}
          <FolderCard
            folderColor="#fff8e1"
            tabColor="#ffecb3"
            dotColor="#f59e0b"
            label="Observer"
            title="Drift Detection"
            description="The Observer flags when your latest thinking contradicts your own principles."
          >
            <Paper rotate={-4} bg="#fffde7" index={0}>
              <p
                style={{
                  fontSize: 8,
                  fontFamily: 'monospace',
                  color: '#b45309',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                }}
              >
                {'⚠  Drift detected\nReasoning is fear-driven — contradicts anchor: "Never decide out of fear"'}
              </p>
            </Paper>
          </FolderCard>

          {/* 4 — Evolution Map */}
          <FolderCard
            folderColor="#f3e5f5"
            tabColor="#e1bee7"
            dotColor="#9c27b0"
            label="Thread Timeline"
            title="Evolution Map"
            description="Watch how your position evolves. Trace the exact moment your thinking shifted."
          >
            <Paper rotate={3} bg="#ffffff" index={0}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 6 }}>
                {[
                  { label: 'Commit #1', note: 'Excited about the move', dot: '#9c27b0' },
                  { label: 'Commit #2', note: 'Doubts creeping in', dot: '#f59e0b' },
                  { label: 'Commit #3', note: 'Anchors revisited ↑', dot: '#4caf50' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: row.dot,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 7.5,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#2a2a24',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: 7.5,
                        fontFamily: 'monospace',
                        color: '#a09e90',
                      }}
                    >
                      — {row.note}
                    </span>
                  </div>
                ))}
              </div>
            </Paper>
          </FolderCard>

        </div>

        {/* Footer */}
        <p
          style={{
            fontSize: 8,
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color: '#d0cec8',
          }}
        >
          Coherence — Reasoning System
        </p>
      </div>

      {/* ── RIGHT — auth panel ── */}
      <div
        className="w-full lg:w-[380px] shrink-0 flex flex-col justify-center p-12 lg:p-16"
        style={{
          background: '#faf9f6',
          borderLeft: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p
              style={{
                fontSize: 8,
                fontFamily: 'monospace',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.35em',
                color: '#c0beb0',
                margin: 0,
              }}
            >
              Your threads are waiting
            </p>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 700,
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                color: '#2a2a24',
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              Sign in to access your archive.
            </h2>
            <p
              style={{
                fontSize: 12,
                fontFamily: 'monospace',
                color: '#b0ae9e',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Your reasoning history is private. Only you can read it.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '12px 14px',
                border: '1px solid #fca5a5',
                background: '#fef2f2',
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#dc2626',
              }}
            >
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
              background: '#2a2a24',
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
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#000000';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#2a2a24';
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#ffffff',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
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

          <p
            style={{
              fontSize: 8,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              color: '#d0cec8',
              margin: 0,
            }}
          >
            Auth Required // v3.0
          </p>

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
