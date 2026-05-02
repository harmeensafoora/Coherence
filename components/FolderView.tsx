
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeThinking } from '../services/geminiService';
import { Folder, ReasoningState, Snapshot, FileEntry } from '../types';
import CoherencePanel from './CoherencePanel';

interface FolderViewProps {
  folder: Folder;
  onBack: () => void;
  onUpdate: (updates: Partial<Folder>) => void;
  onDeleteFolder: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onboardingStep?: string;
}

type CommitPhase = 'idle' | 'saving' | 'analyzing';

const ANALYZING_LABELS = ['Analysing...', 'Reading...', 'Thinking...', 'Working...', 'Observing...'];

const AnalyzingBanner: React.FC = () => {
  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex(i => (i + 1) % ANALYZING_LABELS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8 flex items-center gap-2.5 animate-in fade-in duration-300">
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
      </span>
      <span className="text-[9px] mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 transition-opacity duration-300">
        {ANALYZING_LABELS[labelIndex]}
      </span>
    </div>
  );
};

const RetryBanner: React.FC<{ file: FileEntry; retryingFileId: string | null; onRetry: (file: FileEntry) => void }> = ({ file, retryingFileId, onRetry }) => {
  const isRetrying = retryingFileId === file.id;
  return (
    <div className="mb-10 p-5 border border-[#c0beb0]/40 dark:border-white/10 bg-[#f4f2eb]/60 dark:bg-white/5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isRetrying ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#908e7e] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#908e7e]" />
              </span>
              <span className="text-[10px] mono font-bold uppercase tracking-widest text-[#908e7e] dark:text-[#7a786a]">
                Analysing...
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-[#c0beb0] dark:bg-[#5a5850]" />
              <div>
                <p className="text-[10px] mono font-bold uppercase tracking-widest text-[#908e7e] dark:text-[#7a786a]">
                  Analysis didn't complete
                </p>
                <p className="text-[9px] mono text-[#b0ae9e] dark:text-[#5a5850] mt-0.5">
                  Your commit is saved — run analysis when ready.
                </p>
              </div>
            </>
          )}
        </div>
        {!isRetrying && (
          <button
            onClick={() => onRetry(file)}
            className="px-4 py-2 text-[9px] mono font-bold uppercase tracking-widest text-[#2a2a24] dark:text-[#d1d1c1] border border-[#c0beb0]/40 dark:border-white/10 hover:bg-[#2a2a24] dark:hover:bg-[#d1d1c1] hover:text-white dark:hover:text-[#121210] transition-all"
          >
            Retry Analysis →
          </button>
        )}
      </div>
    </div>
  );
};

const EmptyThreadState: React.FC = () => (
  <div className="mb-12 p-8 border border-dashed border-[#c0beb0]/40 dark:border-white/10 text-center animate-in fade-in duration-500">
    <p className="text-[11px] mono font-bold uppercase tracking-[0.2em] text-[#908e7e] dark:text-[#7a786a] mb-3">
      First commit
    </p>
    <p className="text-[13px] text-[#b0ae9e] dark:text-[#5a5850] leading-relaxed font-light max-w-sm mx-auto">
      Write where your thinking is right now — what you're leaning towards, what's pulling you back, what feels unresolved. Coherence will track how this evolves.
    </p>
  </div>
);

const FolderView: React.FC<FolderViewProps> = ({ folder, onBack, onUpdate, onDeleteFolder, theme, onToggleTheme, onboardingStep }) => {
  const [commitPhase, setCommitPhase] = useState<CommitPhase>('idle');
  const [retryingFileId, setRetryingFileId] = useState<string | null>(null);
  const [newUpdateText, setNewUpdateText] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  // Keep isAnalyzing derived from commitPhase for CoherencePanel compatibility
  const isAnalyzing = commitPhase === 'analyzing';

  useEffect(() => {
    if (onboardingStep === 'commit-index') {
      setShowMobileNav(true);
      setShowMobilePanel(false);
    } else if (onboardingStep === 'coherence-state') {
      setShowMobilePanel(true);
      setShowMobileNav(false);
    } else if (onboardingStep === 'commit-editor' || onboardingStep === 'commit-button') {
      setShowMobileNav(false);
      setShowMobilePanel(false);
      setSelectedFileId(null);
    }
  }, [onboardingStep]);

  const applyAnalysis = (
    commitId: string,
    content: string,
    result: Awaited<ReturnType<typeof analyzeThinking>>,
    currentFiles: FileEntry[],
    currentHistory: Snapshot[]
  ) => {
    const { changeSummary, filename, ...newState } = result;
    const hasDrift = newState.driftDetected.length > 0;
    const contradictionMsg = hasDrift ? newState.driftDetected[0].message : undefined;

    const analyzedFile: FileEntry = {
      id: commitId,
      timestamp: currentFiles.find(f => f.id === commitId)?.timestamp ?? Date.now(),
      filename: filename || `commit-${currentFiles.length}.txt`,
      content,
      status: hasDrift ? 'contradiction' : 'coherent',
      contradictsWith: contradictionMsg,
    };

    const newSnapshot: Snapshot = {
      id: commitId,
      timestamp: analyzedFile.timestamp,
      content,
      state: newState,
      changeSummary: changeSummary || 'State update committed to thread.',
    };

    onUpdate({
      files: currentFiles.map(f => f.id === commitId ? analyzedFile : f),
      state: newState,
      history: [...currentHistory.filter(s => s.id !== commitId).slice(-19), newSnapshot],
    });
  };

  const handleCommit = async () => {
    if (!newUpdateText.trim() || commitPhase !== 'idle') return;

    setCommitPhase('saving');

    const commitId = crypto.randomUUID();
    const pendingFile: FileEntry = {
      id: commitId,
      timestamp: Date.now(),
      filename: `commit-${folder.files.length + 1}.txt`,
      content: newUpdateText,
      status: 'pending',
    };

    const filesWithPending = [...folder.files, pendingFile];
    onUpdate({ files: filesWithPending });
    setNewUpdateText('');
    setSelectedFileId(commitId);
    setCommitPhase('analyzing');

    try {
      const result = await analyzeThinking(newUpdateText, folder.state);
      applyAnalysis(commitId, newUpdateText, result, filesWithPending, folder.history);
    } catch (err: any) {
      console.error("Analysis failed, commit saved as pending:", err);
    } finally {
      setCommitPhase('idle');
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    }
  }, [handleCommit]);

  const handleRetryAnalysis = async (file: FileEntry) => {
    if (retryingFileId) return;
    setRetryingFileId(file.id);
    try {
      const priorSnapshot = folder.history.filter(s => s.timestamp < file.timestamp).slice(-1)[0];
      const priorState = priorSnapshot?.state ?? folder.state;
      const result = await analyzeThinking(file.content, priorState);
      applyAnalysis(file.id, file.content, result, folder.files, folder.history);
    } catch (err) {
      console.error("Retry analysis failed:", err);
    } finally {
      setRetryingFileId(null);
    }
  };

  const handleAddAnchor = (anchor: string) => {
    const newState = { ...folder.state, anchors: [...folder.state.anchors, anchor] };
    onUpdate({ state: newState });
  };

  const handleDeleteAnchor = (anchorToDelete: string) => {
    if (!window.confirm(`Permanently remove anchor: "${anchorToDelete}"?`)) return;
    const newState = { ...folder.state, anchors: folder.state.anchors.filter(a => a !== anchorToDelete) };
    onUpdate({ state: newState });
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    if (!window.confirm("Permanently delete this commit and snapshot? This action is irreversible.")) return;
    onUpdate({
      history: folder.history.filter(s => s.id !== snapshotId),
      files: folder.files.filter(f => f.id !== snapshotId),
    });
  };

  const selectedFile = folder.files.find(f => f.id === selectedFileId);
  const isCreatingNew = !selectedFileId;
  const isCurrentlyAnalyzingSelected = isAnalyzing && selectedFileId && selectedFile?.status === 'pending';

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'contradiction': return { label: 'DRIFTED', color: 'text-amber-600', dot: 'bg-amber-400' };
      case 'coherent':      return { label: 'STABLE',  color: 'text-green-600', dot: 'bg-green-400' };
      default:              return { label: 'PENDING', color: 'text-slate-400',  dot: 'bg-slate-300 dark:bg-slate-700' };
    }
  };

  const getCommitLabel = (file: FileEntry): string => {
    const snapshot = folder.history.find(s => s.id === file.id);
    if (snapshot?.changeSummary) return snapshot.changeSummary;
    return file.filename;
  };

  const commitButtonLabel = () => {
    if (commitPhase === 'saving') return 'Saving...';
    if (commitPhase === 'analyzing') return 'Observing...';
    return 'Commit';
  };

  return (
    <div className="flex h-screen w-full overflow-hidden relative z-10 transition-colors duration-300">

      {/* Mobile backdrop */}
      {(showMobileNav || showMobilePanel) && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => { setShowMobileNav(false); setShowMobilePanel(false); }}
        />
      )}

      {/* Left Sidebar: Commit Index */}
      <nav
        data-tour="commit-index"
        className={`w-64 bg-[#f4f2eb]/80 dark:bg-[#1a1a16]/80 backdrop-blur-sm border-r border-[#c0beb0]/30 dark:border-white/10 flex flex-col h-full overflow-hidden transition-transform duration-300 fixed md:relative inset-y-0 left-0 z-50 md:z-auto md:translate-x-0 ${showMobileNav ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <header className="p-6 border-b border-[#c0beb0]/20 dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold mono uppercase tracking-[0.2em] text-[#908e7e] dark:text-[#7a786a]">Commit Index</span>
          </div>
          <button
            onClick={() => { setSelectedFileId(null); setShowMobileNav(false); }}
            className={`w-full text-center p-3 transition-all mono text-[10px] font-bold tracking-widest uppercase border border-[#c0beb0]/40 dark:border-white/10 ${isCreatingNew ? 'bg-[#2a2a24] dark:bg-[#d1d1c1] text-white dark:text-[#121210] shadow-sm' : 'bg-white/50 dark:bg-white/5 text-[#2a2a24] dark:text-[#d1d1c1] hover:bg-white dark:hover:bg-white/10 transition-colors'}`}
          >
            + New Update
          </button>
        </header>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-1">
          {folder.files.length === 0 && (
            <p className="text-[9px] mono text-[#c0beb0] dark:text-[#5a5850] italic text-center py-6 px-2 leading-relaxed">
              No commits yet. Write your first entry above.
            </p>
          )}
          {folder.files.slice().reverse().map(file => {
            const fullDateStr =
              new Date(file.timestamp).toLocaleDateString([], { month: '2-digit', day: '2-digit' }) + ' ' +
              new Date(file.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const isActive = selectedFileId === file.id;
            const status = getStatusDisplay(file.status);
            const isThisRetrying = retryingFileId === file.id;
            const isThisAnalyzing = isAnalyzing && file.id === selectedFileId && file.status === 'pending';
            const label = getCommitLabel(file);

            return (
              <button
                key={file.id}
                onClick={() => { setSelectedFileId(file.id); setShowMobileNav(false); }}
                className={`w-full text-left p-3 border-l-2 transition-all group flex flex-col gap-1.5 ${isActive ? 'bg-white/60 dark:bg-white/10 border-[#2a2a24] dark:border-[#d1d1c1]' : 'bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] mono text-[#b0ae9e] dark:text-[#7a786a]">{fullDateStr}</span>
                  <div className="flex items-center gap-1.5">
                    {(isThisAnalyzing || isThisRetrying) ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    ) : (
                      <>
                        <span className={`text-[8px] mono font-bold tracking-tighter ${status.color}`}>{status.label}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      </>
                    )}
                  </div>
                </div>
                <div className={`text-[11px] mono truncate tracking-tight leading-tight ${isActive ? 'text-[#2a2a24] dark:text-[#d1d1c1] font-medium' : 'text-[#7a786a] dark:text-[#b0ae9e]'}`}>
                  {label}
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col bg-[#fdfdfc] dark:bg-[#121210] relative min-w-0">
        <header className="px-4 md:px-10 py-4 md:py-6 border-b border-[#f0eee6] dark:border-white/10 flex items-center justify-between bg-white/70 dark:bg-[#121210]/70 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-3 md:gap-6 min-w-0">
            {/* Mobile: commits toggle */}
            <button
              onClick={() => { setShowMobileNav(v => !v); setShowMobilePanel(false); }}
              className="md:hidden flex flex-col gap-[4px] p-1 shrink-0"
              aria-label="Toggle commits"
            >
              <span className="w-4 h-[1.5px] bg-[#908e7e] dark:bg-[#7a786a] block" />
              <span className="w-4 h-[1.5px] bg-[#908e7e] dark:bg-[#7a786a] block" />
              <span className="w-4 h-[1.5px] bg-[#908e7e] dark:bg-[#7a786a] block" />
            </button>
            <button
              onClick={onBack}
              className="text-[12px] mono text-[#908e7e] dark:text-[#7a786a] hover:text-[#2a2a24] dark:hover:text-[#d1d1c1] transition-colors shrink-0"
            >
              &larr; <span className="hidden sm:inline">Exit</span>
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-2 min-w-0">
                <h1 className="text-[14px] md:text-[16px] font-bold text-[#2a2a24] dark:text-[#d1d1c1] uppercase mono tracking-tight truncate">{folder.name}</h1>
                <span className="text-[9px] mono text-[#c0beb0] dark:text-[#7a786a] hidden sm:inline shrink-0">/{selectedFile?.filename || 'scratchpad'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button
              onClick={onToggleTheme}
              className="hidden sm:block px-3 py-1.5 text-[9px] mono font-bold text-[#908e7e] dark:text-[#7a786a] border border-[#c0beb0]/30 dark:border-white/10 hover:border-[#2a2a24] dark:hover:border-[#d1d1c1] transition-all uppercase"
            >
              Mode: {theme}
            </button>
            {/* Mobile: coherence panel toggle */}
            <button
              onClick={() => { setShowMobilePanel(v => !v); setShowMobileNav(false); }}
              className="md:hidden px-2.5 py-1.5 text-[9px] mono font-bold uppercase tracking-widest text-[#908e7e] dark:text-[#7a786a] border border-[#c0beb0]/30 dark:border-white/10"
              aria-label="Toggle coherence panel"
            >
              State
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <div className="max-w-2xl mx-auto w-full py-8 md:py-16 px-4 md:px-8">
            {isCreatingNew ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {folder.files.length === 0 && <EmptyThreadState />}

                <textarea
                  autoFocus
                  data-tour="commit-editor"
                  placeholder="Where is your thinking right now? What are you leaning towards, what's pulling you back, what feels unresolved..."
                  className="w-full min-h-[50vh] text-[16px] leading-[1.8] text-[#3a3a34] dark:text-[#d1d1c1] bg-transparent resize-none border-none outline-none placeholder-[#c0beb0]/50 dark:placeholder-white/10 font-light"
                  value={newUpdateText}
                  onChange={(e) => setNewUpdateText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={commitPhase !== 'idle'}
                />

                <div className="flex items-center justify-between pt-8 border-t border-[#f0eee6] dark:border-white/10">
                  <span className="text-[9px] mono text-[#c0beb0] dark:text-[#5a5850] tracking-widest">
                    {commitPhase === 'idle' ? '⌘ + Enter to commit' : ''}
                  </span>
                  <button
                    disabled={commitPhase !== 'idle' || !newUpdateText.trim()}
                    onClick={handleCommit}
                    data-tour="commit-button"
                    className="px-8 py-3 text-[10px] font-bold mono uppercase tracking-widest bg-[#2a2a24] dark:bg-[#d1d1c1] text-white dark:text-[#121210] hover:bg-black dark:hover:bg-white transition-all disabled:opacity-30 flex items-center gap-2.5"
                  >
                    {commitPhase !== 'idle' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#121210] animate-pulse" />
                    )}
                    {commitButtonLabel()}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-500">

                {/* Drift banner */}
                {selectedFile?.status === 'contradiction' && (
                  <div className="p-6 bg-amber-50/30 dark:bg-amber-900/10 border-l-2 border-amber-300 dark:border-amber-700 mb-10">
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-3 mono">Observer Note</p>
                    <p className="text-[14px] text-amber-900 dark:text-amber-200 leading-relaxed italic opacity-90">
                      "{selectedFile.contradictsWith}"
                    </p>
                  </div>
                )}

                {/* Analyzing banner (fresh commit, analysis in flight) */}
                {isCurrentlyAnalyzingSelected && <AnalyzingBanner />}

                {/* Retry banner (pending but analysis not running) */}
                {selectedFile?.status === 'pending' && !isCurrentlyAnalyzingSelected && (
                  <RetryBanner
                    file={selectedFile}
                    retryingFileId={retryingFileId}
                    onRetry={handleRetryAnalysis}
                  />
                )}

                <div className="text-[16px] leading-[1.9] text-[#3a3a34] dark:text-[#d1d1c1] whitespace-pre-wrap font-light">
                  {selectedFile?.content}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Side Column: Coherence Monitor */}
      <aside
        data-tour="coherence-state"
        className={`w-80 md:w-96 bg-[#f4f2eb]/90 dark:bg-[#1a1a16]/90 backdrop-blur-sm flex flex-col h-full border-l border-[#c0beb0]/30 dark:border-white/10 shadow-[-4px_0_12px_rgba(0,0,0,0.02)] transition-transform duration-300 fixed md:relative inset-y-0 right-0 z-50 md:z-auto md:translate-x-0 ${showMobilePanel ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
      >
        <CoherencePanel
          state={folder.state}
          history={folder.history}
          isAnalyzing={isAnalyzing}
          folderName={folder.name}
          onAddAnchor={handleAddAnchor}
          onDeleteAnchor={handleDeleteAnchor}
          onDeleteSnapshot={handleDeleteSnapshot}
          onDeleteFolder={onDeleteFolder}
        />
      </aside>
    </div>
  );
};

export default FolderView;
