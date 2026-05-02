import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const MOCK_THREADS = [
  {
    id: 'c2f1a849',
    name: 'DO_I_QUIT_MY_JOB',
    created: '02/14/2026',
    accessed: '04/30/2026',
    status: 'drifted' as const,
  },
  {
    id: '9e3b17f2',
    name: 'MOVING_TO_A_NEW_CITY',
    created: '03/01/2026',
    accessed: '05/01/2026',
    status: 'stable' as const,
  },
  {
    id: 'a7d04c31',
    name: 'THE_RELATIONSHIP',
    created: '01/09/2026',
    accessed: '04/28/2026',
    status: 'drifted' as const,
  },
  {
    id: '5b8e2d09',
    name: 'START_A_BUSINESS',
    created: '04/22/2026',
    accessed: '04/22/2026',
    status: 'pending' as const,
  },
];

type ThreadStatus = 'stable' | 'drifted' | 'pending';

const statusConfig: Record<ThreadStatus, { label: string; dot: string; badge: string }> = {
  stable:  { label: 'Stable',  dot: 'bg-[#4ade80]', badge: 'bg-green-900/20 text-green-400' },
  drifted: { label: 'Drifted', dot: 'bg-[#fbbf24]', badge: 'bg-amber-900/20 text-amber-400' },
  pending: { label: 'Pending', dot: 'bg-slate-600',  badge: 'bg-white/5 text-[#7a786a]' },
};

const MockThreadCard: React.FC<{ id: string; name: string; created: string; accessed: string; status: ThreadStatus }> = ({
  id, name, created, accessed, status,
}) => {
  const s = statusConfig[status];
  return (
    <div className="p-5 text-left bg-white/5 border border-white/10 flex flex-col min-h-[9rem] opacity-60 select-none">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          <span className="text-xl text-white/20 mt-0.5">📁</span>
          <div className="flex flex-col">
            <span className="text-[8px] mono text-white/20 font-bold tracking-[0.2em] mb-0.5">
              LOC: {id}
            </span>
            <h3 className="text-[13px] font-bold text-[#d1d1c1] uppercase mono tracking-tight leading-tight">
              {name}
            </h3>
          </div>
        </div>
        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${s.dot}`} />
      </div>
      <div className="mt-auto pt-3 border-t border-white/5 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[8px] mono text-white/20 font-bold uppercase tracking-widest">
            Created: {created}
          </span>
          <span className={`text-[8px] mono font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 ${s.badge}`}>
            {s.label}
          </span>
        </div>
        <span className="text-[8px] mono text-white/20 font-bold uppercase tracking-widest">
          Access: {accessed}
        </span>
      </div>
    </div>
  );
};

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

      {/* LEFT — dark panel with mock thread grid */}
      <div
        className="flex-1 flex flex-col justify-between p-10 lg:p-14"
        style={{
          background: '#121210',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      >
        {/* Brand */}
        <div>
          <p className="text-[8px] mono font-bold uppercase tracking-[0.35em] text-[#2a2a22] mb-5">
            Observer Protocol 3.0
          </p>
          <h1 className="text-[52px] font-bold tracking-[0.08em] text-[#d1d1c1] uppercase leading-none mono glow-text">
            Coherence
          </h1>
          <p className="text-[14px] text-[#3a3830] mt-4 font-light mono">
            Decisions drift.{' '}
            <span className="font-semibold text-[#7a786a]">Anchors don't.</span>
          </p>
        </div>

        {/* Mock thread grid — blurred preview */}
        <div className="my-10 relative">
          <div className="grid grid-cols-2 gap-3">
            {MOCK_THREADS.map(t => (
              <MockThreadCard key={t.id} {...t} />
            ))}
          </div>
          {/* Gradient fade + lock overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, #121210 85%)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 pb-2">
            <p className="text-[11px] mono text-white/25 italic font-light text-center leading-relaxed">
              need to make a decision? still going back and forth?<br />you're in the right place.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[8px] mono text-[#1e1e18] uppercase tracking-[0.3em]">
          Coherence — Reasoning System
        </p>
      </div>

      {/* RIGHT — dark auth panel */}
      <div
        className="w-full lg:w-[360px] shrink-0 flex flex-col justify-center p-10 lg:p-14 border-l border-white/5"
        style={{ background: '#1c1c18' }}
      >
        <div className="space-y-8">

          <div className="space-y-3">
            <p className="text-[8px] mono font-bold uppercase tracking-[0.35em] text-[#3a3830]">
              Your threads are waiting
            </p>
            <h2 className="text-[24px] font-bold mono uppercase tracking-tight text-[#d1d1c1] leading-tight">
              Sign in to access your archive.
            </h2>
            <p className="text-[12px] text-[#5a5850] leading-relaxed">
              Your reasoning history is private. Only you can read it.
            </p>
          </div>

          {error && (
            <div className="p-3 border border-red-900/50 bg-red-900/20 text-[11px] mono text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-5 flex items-center justify-center gap-3 bg-[#d1d1c1] text-[#121210] hover:bg-white transition-colors disabled:opacity-40 mono text-[11px] font-bold uppercase tracking-[0.2em]"
          >
            {loading ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#121210] animate-pulse" />
                Redirecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#121210">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="text-[8px] mono text-[#2a2a22] uppercase tracking-[0.3em]">
            Auth Required // v3.0
          </p>

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
