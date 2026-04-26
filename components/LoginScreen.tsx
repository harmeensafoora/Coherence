import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const FEATURES = [
  {
    key: 'thread',
    num: '01',
    label: 'THREADS',
    tagline: 'One space per decision.',
    dot: 'bg-[#4ade80]',
    status: 'STABLE',
    statusColor: 'text-green-600 dark:text-green-400',
    content: [
      { icon: '📁', text: 'CAREER_DIRECTION/', bold: true },
      { icon: '  ✓', text: 'vision.txt', color: 'text-green-600 dark:text-green-400' },
      { icon: '  ⚠', text: 'pivot-idea.log', color: 'text-amber-600 dark:text-amber-400' },
      { icon: '  ✓', text: 'resolution.txt', color: 'text-green-600 dark:text-green-400' },
    ],
  },
  {
    key: 'commit',
    num: '02',
    label: 'COMMITS',
    tagline: 'Snapshot your thinking.',
    dot: 'bg-blue-400',
    status: 'COMMITTED',
    statusColor: 'text-blue-600 dark:text-blue-400',
    content: [
      { icon: '›', text: '09:14  Initial vision set' },
      { icon: '›', text: '11:32  Constraint added' },
      { icon: '⚠', text: '14:07  Drift detected', color: 'text-amber-600 dark:text-amber-400' },
      { icon: '›', text: '16:20  Resolution committed' },
    ],
  },
  {
    key: 'anchor',
    num: '03',
    label: 'ANCHORS',
    tagline: 'The lines you refuse to cross.',
    dot: 'bg-purple-400',
    status: 'PROTECTED',
    statusColor: 'text-purple-600 dark:text-purple-400',
    content: [
      { icon: '🔒', text: 'Masters before full-time roles' },
      { icon: '🔒', text: 'Only AI product companies' },
      { icon: '🔒', text: 'Gulf market, not a fallback' },
    ],
  },
  {
    key: 'drift',
    num: '04',
    label: 'DRIFT',
    tagline: 'Know the moment you contradict yourself.',
    dot: 'bg-amber-400',
    status: 'DRIFTED ⚠',
    statusColor: 'text-amber-600 dark:text-amber-400',
    content: [
      { icon: '●', text: 'ANCHOR VIOLATED', color: 'text-amber-600 dark:text-amber-400', bold: true },
      { icon: ' ', text: '"Only AI product companies"' },
      { icon: '↳', text: 'Bangalore idea contradicts', color: 'text-amber-600 dark:text-amber-400' },
    ],
  },
];

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
    <div className="min-h-screen flex flex-col lg:flex-row relative z-10">

      {/* LEFT */}
      <div className="flex-1 flex flex-col justify-center p-10 lg:p-16 gap-10">

        <div>
          <h1 className="text-[56px] font-bold tracking-[0.1em] text-[#2a2a24] dark:text-[#d1d1c1] uppercase leading-none glow-text mono">
            Coherence
          </h1>
          <p className="text-[18px] text-[#4a483a] dark:text-[#908e7e] mt-3 font-light tracking-wide">
            Version control for <span className="font-semibold text-[#2a2a24] dark:text-[#d1d1c1]">your thinking.</span>
          </p>
        </div>

        {/* Stacked manila folders */}
        <div className="flex flex-col gap-0">
          {FEATURES.map((f, i) => {
            const folderColors = [
              { body: '#f5e9a8', tab: '#e8d46e', border: '#c8a830', shadow: '#b89020', text: '#3a2a0a' },
              { body: '#f0e090', tab: '#e0cc60', border: '#c0a020', shadow: '#a88010', text: '#3a2a0a' },
              { body: '#f7edba', tab: '#ecdb7a', border: '#d0b040', shadow: '#c09828', text: '#3a2a0a' },
              { body: '#ede4a0', tab: '#dfd070', border: '#bca028', shadow: '#a88818', text: '#3a2a0a' },
            ];
            const c = folderColors[i];
            return (
              <div key={f.key} style={{ marginTop: i === 0 ? 0 : -2, zIndex: i + 1, position: 'relative' }}>
                {/* Tab row */}
                <div className="flex items-end">
                  <div
                    className="px-4 py-1.5 flex items-center gap-2"
                    style={{
                      background: c.tab,
                      border: `1.5px solid ${c.border}`,
                      borderBottom: 'none',
                      borderRadius: '5px 5px 0 0',
                      minWidth: '160px',
                      boxShadow: `-1px -1px 0 ${c.shadow}`,
                    }}
                  >
                    <span className="text-[8px] mono font-bold" style={{ color: c.shadow }}>{f.num}</span>
                    <span className="text-[11px] mono font-black uppercase tracking-widest" style={{ color: c.text }}>{f.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />
                  </div>
                  <div style={{ flex: 1, borderBottom: `1.5px solid ${c.border}` }} />
                  <div
                    className="px-3 py-1.5"
                    style={{
                      background: c.tab,
                      border: `1.5px solid ${c.border}`,
                      borderBottom: 'none',
                      borderRadius: '5px 5px 0 0',
                    }}
                  >
                    <span className={`text-[8px] mono font-bold uppercase tracking-widest ${f.statusColor}`}>{f.status}</span>
                  </div>
                </div>

                {/* Folder body */}
                <div
                  className="px-5 py-4"
                  style={{
                    background: c.body,
                    border: `1.5px solid ${c.border}`,
                    borderTop: 'none',
                    boxShadow: `3px 3px 0 ${c.shadow}`,
                  }}
                >
                  <p className="text-[9px] mono italic mb-2.5" style={{ color: c.shadow }}>— {f.tagline}</p>
                  {f.content.map((line, li) => (
                    <div key={li} className="flex items-baseline gap-2.5 py-0.5">
                      <span className="text-[10px] mono w-4 shrink-0" style={{ color: c.shadow }}>{line.icon}</span>
                      <span className={`text-[11px] mono ${line.color || ''}`} style={!line.color ? { color: c.text } : {}} >
                        {line.bold ? <strong>{line.text}</strong> : line.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT — Auth */}
      <div className="w-full lg:w-[360px] shrink-0 flex flex-col justify-center p-10 lg:p-12 border-t lg:border-t-0 lg:border-l border-[#c0beb0]/40 dark:border-white/10 bg-[#f4f2eb]/80 dark:bg-[#1a1a16]/80">
        <div className="space-y-7">

          <div className="space-y-2">
            <p className="text-[9px] mono font-bold uppercase tracking-[0.3em] text-[#b0ae9e] dark:text-[#7a786a]">
              Your threads are waiting
            </p>
            <h2 className="text-[24px] font-bold mono uppercase tracking-tight text-[#2a2a24] dark:text-[#d1d1c1] leading-tight">
              Sign in to access your archive.
            </h2>
            <p className="text-[12px] text-[#7a786a] leading-relaxed pt-1">
              Your reasoning history is private. Only you can read it.
            </p>
          </div>

          {error && (
            <div className="p-3 border border-red-300/50 bg-red-50 dark:bg-red-900/20 text-[11px] mono text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-5 flex items-center justify-center gap-3 bg-[#2a2a24] dark:bg-[#d1d1c1] text-white dark:text-[#121210] hover:bg-black dark:hover:bg-white transition-colors disabled:opacity-40 mono text-[11px] font-bold uppercase tracking-[0.2em]"
          >
            {loading ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#121210]" />
                Redirecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="text-[9px] mono font-bold uppercase tracking-[0.3em] text-[#c0beb0] dark:text-[#7a786a]">
            Observer Protocol 3.0 // Auth Required
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
