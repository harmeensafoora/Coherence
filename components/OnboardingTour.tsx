import React, { useEffect, useMemo, useState } from 'react';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  route?: 'home' | 'folder';
}

interface OnboardingTourProps {
  steps: TourStep[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  currentStep,
  onNext,
  onBack,
  onSkip,
  onFinish,
}) => {
  const step = steps[currentStep];
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!step) return;

    const updateRect = () => {
      const target = document.querySelector(`[data-tour="${step.target}"]`);
      if (!target) {
        setRect(null);
        return;
      }

      const nextRect = target.getBoundingClientRect();
      setRect(nextRect);
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    };

    updateRect();
    const raf = window.requestAnimationFrame(updateRect);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [step]);

  const bubbleStyle = useMemo<React.CSSProperties>(() => {
    const fallback: React.CSSProperties = {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    };

    if (!rect) return fallback;

    const margin = 16;
    const width = Math.min(340, window.innerWidth - 32);
    const placement = step.placement || 'bottom';
    const clampX = (x: number) => Math.max(16, Math.min(x, window.innerWidth - width - 16));

    if (placement === 'top') {
      return { width, left: clampX(rect.left + rect.width / 2 - width / 2), top: Math.max(16, rect.top - 190) };
    }
    if (placement === 'left') {
      return { width, left: clampX(rect.left - width - margin), top: Math.max(16, Math.min(rect.top, window.innerHeight - 220)) };
    }
    if (placement === 'right') {
      return { width, left: clampX(rect.right + margin), top: Math.max(16, Math.min(rect.top, window.innerHeight - 220)) };
    }
    return { width, left: clampX(rect.left + rect.width / 2 - width / 2), top: Math.min(rect.bottom + margin, window.innerHeight - 220) };
  }, [rect, step]);

  if (!step) return null;

  const isLast = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[2000] pointer-events-none">
      <div className="absolute inset-0 bg-black/24" />

      {rect && (
        <div
          className="absolute rounded-sm border border-[#2a2a24] shadow-[0_0_0_9999px_rgba(0,0,0,0.24)] transition-all duration-200"
          style={{
            left: rect.left - 8,
            top: rect.top - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            background: 'rgba(250,249,246,0.08)',
          }}
        />
      )}

      <div
        className="absolute pointer-events-auto bg-[#faf9f6] dark:bg-[#1a1a16] border border-[#c0beb0] dark:border-white/10 shadow-[6px_6px_0_rgba(42,42,36,0.35)] p-5"
        style={bubbleStyle}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-[8px] mono font-bold uppercase tracking-[0.28em] text-[#b0ae9e] dark:text-[#7a786a] mb-2">
              Walkthrough {currentStep + 1}/{steps.length}
            </p>
            <h2 className="text-[14px] mono font-bold uppercase tracking-[0.08em] text-[#2a2a24] dark:text-[#d1d1c1] leading-tight">
              {step.title}
            </h2>
          </div>
          <button
            onClick={onSkip}
            className="text-[9px] mono font-bold uppercase tracking-widest text-[#908e7e] dark:text-[#7a786a] hover:text-[#2a2a24] dark:hover:text-[#d1d1c1]"
          >
            Skip
          </button>
        </div>

        <p className="text-[12px] leading-relaxed text-[#5a5850] dark:text-[#b0ae9e] mb-5">
          {step.body}
        </p>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            disabled={currentStep === 0}
            className="text-[9px] mono font-bold uppercase tracking-widest text-[#908e7e] dark:text-[#7a786a] disabled:opacity-25"
          >
            Back
          </button>
          <button
            onClick={isLast ? onFinish : onNext}
            className="px-4 py-2 bg-[#2a2a24] dark:bg-[#d1d1c1] text-white dark:text-[#121210] text-[9px] mono font-bold uppercase tracking-widest"
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
