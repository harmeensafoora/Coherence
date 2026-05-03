import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

type UseCaseStatus = 'STABLE' | 'DRIFTED';

interface UseCase {
  id: string;
  title: string;
  status: UseCaseStatus;
  commitCount: number;
  folderColor: string;
  tabColor: string;
  borderColor: string;
  paperBg: string;
  summary: string;
  detail: string;
  notes: string[];
}

const useCases: UseCase[] = [
  {
    id: 'quit-job',
    title: 'Quit_The_Job',
    status: 'DRIFTED',
    commitCount: 5,
    folderColor: '#daeef4',
    tabColor: '#8cc8d8',
    borderColor: '#7ab8c8',
    paperBg: '#f0fafd',
    summary: 'Week 1: leaving. Week 3: raise. Week 5: wanting out again, but from fear.',
    detail: 'Coherence shows the shift from job-fit reasoning to fear-based reasoning.',
    notes: ['Anchor: do not make fear-based decisions', 'Raise changed the logic in week 3', 'Week 5 entry flagged immediately'],
  },
  {
    id: 'where-to-live',
    title: 'Choose_The_City',
    status: 'DRIFTED',
    commitCount: 12,
    folderColor: '#fef3c7',
    tabColor: '#f5cc40',
    borderColor: '#e8b820',
    paperBg: '#fffdf0',
    summary: 'Rent, commute, family, career. Three weeks in, the original rules start bending.',
    detail: 'The thread holds the first priorities steady when compromise starts sounding reasonable.',
    notes: ['Anchor: under GBP 1,500/month', 'Anchor: commute under 45 mins', 'Flat viewing compromised both'],
  },
  {
    id: 'relationship',
    title: 'Relationship_Call',
    status: 'STABLE',
    commitCount: 10,
    folderColor: '#d8f0dc',
    tabColor: '#86c890',
    borderColor: '#74b87e',
    paperBg: '#f0faf2',
    summary: 'Tuesday-you wanted space. Saturday-you wanted reassurance. Both are in the file.',
    detail: 'See what you actually thought across moods before ending it, moving in, or trying long distance.',
    notes: ['Tuesday entry: need distance', 'Saturday entry: fear of loss', 'Pattern: mood changed, anchor did not'],
  },
  {
    id: 'postgrad-pivot',
    title: 'Masters_Or_Job',
    status: 'STABLE',
    commitCount: 16,
    folderColor: '#ead6f5',
    tabColor: '#b880d0',
    borderColor: '#a870c0',
    paperBg: '#f8f0ff',
    summary: 'A parent call, a LinkedIn post, a shiny course page. The plan keeps wobbling.',
    detail: 'Tracks whether you are moving towards clarity or being pulled by whoever spoke last.',
    notes: ['Masters rationale still consistent', 'LinkedIn post triggered pivot', 'Parent call changed risk tolerance'],
  },
  {
    id: 'freelance-fulltime',
    title: 'Freelance_Vs_FT',
    status: 'DRIFTED',
    commitCount: 13,
    folderColor: '#f5ded3',
    tabColor: '#d99b7f',
    borderColor: '#c8876b',
    paperBg: '#fff4ef',
    summary: 'Bad client week: salary. Good month: freedom. The loop is getting obvious.',
    detail: 'Anchors stop you from deciding in a bad week what you would regret in a good one.',
    notes: ['Anchor: keep schedule autonomy', 'Income floor: GBP 3k/month', 'Bad week distorted the conclusion'],
  },
  {
    id: 'family-boundary',
    title: 'Set_The_Boundary',
    status: 'DRIFTED',
    commitCount: 9,
    folderColor: '#e6e1d8',
    tabColor: '#b7ad9d',
    borderColor: '#9f9484',
    paperBg: '#fbf8f1',
    summary: 'Address it, cut contact, or set a boundary. The emotional noise is loud.',
    detail: 'Separates what you believe from what you feel in the moment.',
    notes: ['Original belief: this needs addressing', 'Commit 4 softened the boundary', 'Drift: peacekeeping over clarity'],
  },
  {
    id: 'get-dog',
    title: 'Get_A_Dog',
    status: 'STABLE',
    commitCount: 8,
    folderColor: '#dce7f7',
    tabColor: '#91aad3',
    borderColor: '#7f9bc6',
    paperBg: '#f2f6ff',
    summary: 'You named it. You looked at breeds. Then commitment math closed the tab.',
    detail: 'Keeps the cute version of the decision in the same room as the daily responsibility.',
    notes: ['Anchor: can handle daily care', 'Travel schedule still unresolved', 'Decision paused, not abandoned'],
  },
  {
    id: 'delete-app',
    title: 'Delete_The_App',
    status: 'DRIFTED',
    commitCount: 18,
    folderColor: '#ffdfe4',
    tabColor: '#e58ca0',
    borderColor: '#d37288',
    paperBg: '#fff2f5',
    summary: 'Eight months on the app. Every Sunday becomes one more week.',
    detail: 'Flags the difference between actually wanting to date and swiping because boredom is nearby.',
    notes: ['Anchor: stop swiping out of boredom', 'Commit 12: one more week again', 'Drift: habit disguised as hope'],
  },
  {
    id: 'book-trip',
    title: 'Book_The_Trip',
    status: 'STABLE',
    commitCount: 6,
    folderColor: '#ddf0ed',
    tabColor: '#7fc4b9',
    borderColor: '#6ab3a8',
    paperBg: '#f1fffc',
    summary: 'Nearly booked for six months. Somehow there is always a reason to wait.',
    detail: 'Shows whether caution is useful planning or just a softer name for delay.',
    notes: ['Budget already works', 'Dates chosen twice', 'Next commit must be booking or no'],
  },
  {
    id: 'ask-raise',
    title: 'Ask_For_Raise',
    status: 'DRIFTED',
    commitCount: 7,
    folderColor: '#efe3cd',
    tabColor: '#caa15d',
    borderColor: '#b88f4f',
    paperBg: '#fff8e8',
    summary: 'You know you deserve it. You prepared. The meeting keeps moving.',
    detail: 'Records when preparation has become a socially acceptable form of avoidance.',
    notes: ['Evidence doc complete', 'Meeting rescheduled twice', 'Anchor: ask before month end'],
  },
  {
    id: 'go-vegan',
    title: 'Go_Vegan',
    status: 'DRIFTED',
    commitCount: 11,
    folderColor: '#d9efd0',
    tabColor: '#8abd72',
    borderColor: '#78aa62',
    paperBg: '#f3ffed',
    summary: 'Three failed attempts. Every burger appearance collapses the anchors.',
    detail: 'Turns the pattern into something visible instead of another private reset.',
    notes: ['Anchor: no meat on weekdays', 'Burger reset happened again', 'Plan needs friction, not shame'],
  },
];

const text = (size = 9): React.CSSProperties => ({
  fontSize: size,
  fontFamily: 'monospace',
  color: '#3a3a34',
  lineHeight: 1.55,
  margin: 0,
});

const marqueeStyles = `
  .signin-marquee-page {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    overflow: hidden;
    background: #f0ede8;
    background-image:
      linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px);
    background-size: 32px 32px;
  }

  .signin-marquee-page::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(250,249,246,0.88) 0%, rgba(250,249,246,0.62) 34%, rgba(240,237,232,0.16) 72%);
    pointer-events: none;
    z-index: 2;
  }

  .signin-marquee-field {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 46px;
    transform: rotate(-2deg) scale(1.04);
    z-index: 1;
  }

  .signin-marquee-row {
    display: flex;
    width: max-content;
    gap: 28px;
    animation: signin-marquee 78s linear infinite;
  }

  .signin-marquee-row.reverse {
    animation-name: signin-marquee-reverse;
    margin-left: -360px;
  }

  .signin-marquee-row:hover,
  .signin-marquee-row:focus-within {
    animation-play-state: paused;
  }

  .signin-flip-card {
    width: 316px;
    height: 336px;
    border: 0;
    padding: 0;
    background: transparent;
    perspective: 1000px;
    flex: 0 0 auto;
  }

  .signin-flip-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .signin-flip-card:hover .signin-flip-inner,
  .signin-flip-card:focus-visible .signin-flip-inner,
  .signin-flip-card.is-flipped .signin-flip-inner {
    transform: rotateY(180deg);
  }

  .signin-card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
  }

  .signin-card-back {
    transform: rotateY(180deg);
  }

  .signin-center {
    position: relative;
    z-index: 4;
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px;
  }

  .signin-console {
    width: min(100%, 520px);
    background: rgba(250, 249, 246, 0.86);
    border: 1px solid rgba(26, 26, 24, 0.12);
    box-shadow: 8px 8px 0 rgba(26, 26, 24, 0.18), 0 28px 80px rgba(26, 26, 24, 0.16);
    backdrop-filter: blur(12px);
    padding: 36px;
    text-align: center;
  }

  @keyframes signin-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(calc(-50% - 14px)); }
  }

  @keyframes signin-marquee-reverse {
    from { transform: translateX(calc(-50% - 14px)); }
    to { transform: translateX(0); }
  }

  @media (max-width: 720px) {
    .signin-center {
      align-items: center;
      padding: 18px;
    }

    .signin-console {
      width: min(100%, 348px);
      padding: 24px 18px;
      box-shadow: 5px 5px 0 rgba(26, 26, 24, 0.18), 0 20px 60px rgba(26, 26, 24, 0.14);
    }
  }

  @media (max-width: 420px) {
    .signin-console {
      width: min(100%, 332px);
      padding: 22px 16px;
    }

    .signin-console button {
      letter-spacing: 0.12em !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .signin-marquee-row {
      animation-play-state: paused;
    }

    .signin-flip-inner {
      transition: none;
    }
  }
`;

const FolderFace = ({ useCase }: { useCase: UseCase }) => {
  const isDrifted = useCase.status === 'DRIFTED';

  return (
    <div style={{ position: 'relative', height: '100%', paddingTop: 72 }}>
      <div style={{
        position: 'absolute',
        top: 6,
        left: 28,
        right: 22,
        height: 108,
        background: useCase.paperBg,
        borderRadius: 4,
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
        transform: 'rotate(-4deg)',
        padding: '13px 14px',
        overflow: 'hidden',
        zIndex: 1,
      }}>
        <span style={{
          display: 'block',
          fontSize: 7,
          fontFamily: 'monospace',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: '#a0ae9e',
          marginBottom: 8,
        }}>
          Observer Note
        </span>
        <p style={{ ...text(9), color: isDrifted ? '#92400e' : '#2e7d32', fontStyle: 'italic' }}>
          {useCase.detail}
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          position: 'absolute',
          top: -34,
          left: 0,
          width: 112,
          height: 36,
          background: useCase.tabColor,
          borderRadius: '8px 8px 0 0',
          border: `1px solid ${useCase.borderColor}`,
          borderBottom: 'none',
        }} />
        <div style={{
          height: 246,
          background: useCase.folderColor,
          borderRadius: '0 10px 10px 10px',
          border: `1px solid ${useCase.borderColor}`,
          boxShadow: '0 10px 24px rgba(0,0,0,0.11)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <p style={{
                ...text(13),
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#1a1a18',
              }}>
                {useCase.title}
              </p>
              <span style={{
                fontSize: 8,
                fontFamily: 'monospace',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: isDrifted ? '#b45309' : '#2e7d32',
                whiteSpace: 'nowrap',
              }}>
                {useCase.status}
              </span>
            </div>
            <p style={{ ...text(12), color: '#5a5850', fontStyle: 'italic', marginTop: 18 }}>
              "{useCase.summary}"
            </p>
          </div>

          <div style={{
            borderTop: `1px solid ${useCase.borderColor}`,
            paddingTop: 11,
            display: 'grid',
            gap: 6,
          }}>
            {useCase.notes.slice(0, 2).map((note, index) => (
              <div key={note} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: index === 0 ? '#4caf50' : isDrifted ? '#f59e0b' : '#86c890',
                  flexShrink: 0,
                }} />
                <span style={{
                  ...text(8.5),
                  color: '#5a5850',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CommitFace = ({ useCase }: { useCase: UseCase }) => {
  const isDrifted = useCase.status === 'DRIFTED';

  return (
    <div style={{
      height: '100%',
      background: '#faf9f6',
      border: `1px solid ${useCase.borderColor}`,
      boxShadow: '0 10px 24px rgba(0,0,0,0.11)',
      borderRadius: 10,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <div>
        <p style={{
          fontSize: 8,
          fontFamily: 'monospace',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
          color: isDrifted ? '#b45309' : '#2e7d32',
          margin: '0 0 14px',
        }}>
          {useCase.status} / {useCase.commitCount} commits
        </p>
        <p style={{
          ...text(16),
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: '#1a1a18',
          marginBottom: 14,
        }}>
          {useCase.title}
        </p>
        <p style={{ ...text(10.5), color: '#5a5850', marginBottom: 14 }}>
          {useCase.detail}
        </p>
      </div>

      <div style={{ display: 'grid', gap: 9 }}>
        {useCase.notes.map((note, index) => (
          <div key={note} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: index === 0 ? useCase.paperBg : '#f0ede8',
            border: '1px solid rgba(0,0,0,0.07)',
            padding: '9px 10px',
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: index === 0 ? '#4caf50' : isDrifted ? '#f59e0b' : '#86c890',
              flexShrink: 0,
            }} />
              <span style={{ ...text(8.5), color: '#3a3a34' }}>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarqueeCard = ({ useCase }: { useCase: UseCase }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`signin-flip-card${flipped ? ' is-flipped' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`${useCase.title} use case`}
      onClick={() => setFlipped(prev => !prev)}
      onBlur={() => setFlipped(false)}
    >
      <div className="signin-flip-inner">
        <div className="signin-card-face">
          <FolderFace useCase={useCase} />
        </div>
        <div className="signin-card-face signin-card-back">
          <CommitFace useCase={useCase} />
        </div>
      </div>
    </div>
  );
};

const MarqueeRow = ({ reverse = false }: { reverse?: boolean }) => {
  // 2× is sufficient for a seamless infinite loop; 3× was tripling the GPU layer count
  const cards = [...useCases, ...useCases];

  return (
    <div className={`signin-marquee-row${reverse ? ' reverse' : ''}`}>
      {cards.map((useCase, index) => (
        <MarqueeCard key={`${useCase.id}-${index}`} useCase={useCase} />
      ))}
    </div>
  );
};

// Static decorative backdrop for mobile — no animation, no 3D, zero GPU pressure
const mobileCards = [
  { useCase: useCases[0],  top: '-4%',  left: '-8%',  rotate: '-6deg'  },
  { useCase: useCases[3],  top: '-2%',  right: '-6%', rotate:  '7deg'  },
  { useCase: useCases[6],  top: '28%',  left: '-12%', rotate: '-3deg'  },
  { useCase: useCases[9],  top: '30%',  right: '-10%',rotate:  '5deg'  },
  { useCase: useCases[1],  bottom: '-4%',left: '-6%', rotate:  '4deg'  },
  { useCase: useCases[7],  bottom: '-2%',right: '-8%',rotate: '-8deg'  },
];

const MobileBackground = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1 }}>
    {mobileCards.map(({ useCase, rotate, ...pos }, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: 220,
        ...pos,
        transform: `rotate(${rotate})`,
        opacity: 0.55,
      }}>
        {/* Tab */}
        <div style={{
          width: 80,
          height: 26,
          background: useCase.tabColor,
          borderRadius: '6px 6px 0 0',
          border: `1px solid ${useCase.borderColor}`,
          borderBottom: 'none',
          marginLeft: 12,
        }} />
        {/* Body */}
        <div style={{
          background: useCase.folderColor,
          borderRadius: '0 8px 8px 8px',
          border: `1px solid ${useCase.borderColor}`,
          padding: '14px 16px',
        }}>
          <p style={{
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#1a1a18',
            margin: '0 0 8px',
          }}>
            {useCase.title}
          </p>
          <p style={{
            fontSize: 8,
            fontFamily: 'monospace',
            color: '#5a5850',
            lineHeight: 1.5,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}>
            {useCase.summary}
          </p>
        </div>
      </div>
    ))}
    {/* Overlay to fade cards into background */}
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at center, rgba(250,249,246,0.82) 0%, rgba(250,249,246,0.6) 40%, rgba(240,237,232,0.2) 100%)',
    }} />
  </div>
);

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <div className="signin-marquee-page">
      <style>{marqueeStyles}</style>

      {isMobile ? (
        <MobileBackground />
      ) : (
        <div className="signin-marquee-field">
          <MarqueeRow />
          <MarqueeRow reverse />
        </div>
      )}

      <main className="signin-center">
        <div className="signin-console">
          <p style={{
            fontSize: 8,
            fontFamily: 'monospace',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.34em',
            color: '#9a988a',
            margin: '0 0 18px',
          }}>
            Your threads are waiting
          </p>
          <h1 style={{
            fontSize: 'clamp(34px, 11vw, 70px)',
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: '0.08em',
            color: '#1a1a18',
            textTransform: 'uppercase',
            lineHeight: 0.95,
            margin: 0,
          }}>
            Coherence
          </h1>
          <p style={{
            fontSize: 12,
            fontFamily: 'monospace',
            fontWeight: 600,
            color: '#5a5850',
            margin: '16px 0 28px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            Version control for your thinking
          </p>
          <p style={{
            fontSize: 12,
            fontFamily: 'monospace',
            color: '#706e62',
            lineHeight: 1.7,
            margin: '0 auto 28px',
            maxWidth: 360,
          }}>
            Sign in to catch the moment your reasons change before the story rewrites itself.
          </p>

          {error && (
            <div style={{
              padding: '12px 14px',
              border: '1px solid #fca5a5',
              background: '#fef2f2',
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#dc2626',
              marginBottom: 18,
              textAlign: 'left',
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              maxWidth: 330,
              padding: '17px 0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              background: '#1a1a18',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.4 : 1,
              transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.background = '#000';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#1a1a18';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
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

          <p style={{
            fontSize: 9,
            fontFamily: 'monospace',
            color: '#b0ae9e',
            marginTop: 20,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Coherence for Teams — coming soon
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginScreen;
