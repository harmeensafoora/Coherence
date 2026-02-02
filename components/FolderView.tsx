
import React, { useState } from 'react';
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
}

const FolderView: React.FC<FolderViewProps> = ({ folder, onBack, onUpdate, onDeleteFolder, theme, onToggleTheme }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newUpdateText, setNewUpdateText] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleCommit = async () => {
    if (!newUpdateText.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeThinking(newUpdateText, folder.state);
      const { changeSummary, filename, ...newState } = result;

      const hasDrift = newState.driftDetected.length > 0;
      const contradictionMsg = hasDrift ? newState.driftDetected[0].message : undefined;

      const newFile: FileEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        filename: filename || `commit-${folder.files.length + 1}.log`,
        content: newUpdateText,
        status: hasDrift ? 'contradiction' : 'coherent',
        contradictsWith: contradictionMsg
      };

      const newSnapshot: Snapshot = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        content: newUpdateText,
        state: newState,
        changeSummary: changeSummary || 'State update committed to thread.'
      };

      onUpdate({
        files: [...folder.files, newFile],
        state: newState,
        history: [...folder.history.slice(-19), newSnapshot]
      });

      setNewUpdateText('');
      setSelectedFileId(newFile.id);
    } catch (err) {
      console.error("Commit failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddAnchor = (anchor: string) => {
    const newState = {
      ...folder.state,
      anchors: [...folder.state.anchors, anchor]
    };
    onUpdate({ state: newState });
  };

  const handleDeleteAnchor = (anchorToDelete: string) => {
    if (!window.confirm(`Permanently remove anchor: "${anchorToDelete}"?`)) return;
    const newState = {
      ...folder.state,
      anchors: folder.state.anchors.filter(a => a !== anchorToDelete)
    };
    onUpdate({ state: newState });
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    if (!window.confirm("Permanently delete this commit and snapshot? This action is irreversible.")) return;
    const newHistory = folder.history.filter(s => s.id !== snapshotId);
    onUpdate({
      history: newHistory,
    });
  };

  const selectedFile = folder.files.find(f => f.id === selectedFileId);
  const isCreatingNew = !selectedFileId;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'contradiction':
        return { label: 'DRIFTED', color: 'text-amber-600', dot: 'bg-amber-400' };
      case 'coherent':
        return { label: 'STABLE', color: 'text-green-600', dot: 'bg-green-400' };
      default:
        return { label: 'PENDING', color: 'text-slate-400', dot: 'bg-slate-300 dark:bg-slate-700' };
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden relative z-10 transition-colors duration-300">
      {/* Left Sidebar: Commit Index */}
      <nav className="w-64 bg-[#f4f2eb]/80 dark:bg-[#1a1a16]/80 backdrop-blur-sm border-r border-[#c0beb0]/30 dark:border-white/10 flex flex-col h-full overflow-hidden">
        <header className="p-6 border-b border-[#c0beb0]/20 dark:border-white/10">
           <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold mono uppercase tracking-[0.2em] text-[#908e7e] dark:text-[#7a786a]">Commit Index</span>
           </div>
           <button 
             onClick={() => setSelectedFileId(null)}
             className={`w-full text-center p-3 transition-all mono text-[10px] font-bold tracking-widest uppercase border border-[#c0beb0]/40 dark:border-white/10 ${isCreatingNew ? 'bg-[#2a2a24] dark:bg-[#d1d1c1] text-white dark:text-[#121210] shadow-sm' : 'bg-white/50 dark:bg-white/5 text-[#2a2a24] dark:text-[#d1d1c1] hover:bg-white dark:hover:bg-white/10 transition-colors'}`}
           >
             + New Update
           </button>
        </header>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-1">
           {folder.files.slice().reverse().map(file => {
             const fullDateStr = new Date(file.timestamp).toLocaleDateString([], { month: '2-digit', day: '2-digit' }) + ' ' + new Date(file.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
             const isActive = selectedFileId === file.id;
             const status = getStatusDisplay(file.status);
             
             return (
               <button
                 key={file.id}
                 onClick={() => setSelectedFileId(file.id)}
                 className={`w-full text-left p-3 border-l-2 transition-all group flex flex-col gap-1.5 ${isActive ? 'bg-white/60 dark:bg-white/10 border-[#2a2a24] dark:border-[#d1d1c1]' : 'bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5'}`}
               >
                 <div className="flex items-center justify-between">
                   <span className="text-[9px] mono text-[#b0ae9e] dark:text-[#7a786a]">{fullDateStr}</span>
                   <div className="flex items-center gap-1.5">
                     <span className={`text-[8px] mono font-bold tracking-tighter ${status.color}`}>
                       {status.label}
                     </span>
                     <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                   </div>
                 </div>
                 <div className={`text-[12px] mono truncate tracking-tight leading-tight ${isActive ? 'text-[#2a2a24] dark:text-[#d1d1c1] font-medium' : 'text-[#7a786a] dark:text-[#b0ae9e]'}`}>
                   {file.filename}
                 </div>
               </button>
             );
           })}
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col bg-[#fdfdfc] dark:bg-[#121210] relative">
        <header className="px-10 py-6 border-b border-[#f0eee6] dark:border-white/10 flex items-center justify-between bg-white/70 dark:bg-[#121210]/70 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center space-x-6">
            <button 
              onClick={onBack} 
              className="text-[12px] mono text-[#908e7e] dark:text-[#7a786a] hover:text-[#2a2a24] dark:hover:text-[#d1d1c1] transition-colors"
            >
              &larr; Exit
            </button>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <h1 className="text-[16px] font-bold text-[#2a2a24] dark:text-[#d1d1c1] uppercase mono tracking-tight">{folder.name}</h1>
                <span className="text-[9px] mono text-[#c0beb0] dark:text-[#7a786a]">/{selectedFile?.filename || 'scratchpad'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleTheme}
              className="px-3 py-1.5 text-[9px] mono font-bold text-[#908e7e] dark:text-[#7a786a] border border-[#c0beb0]/30 dark:border-white/10 hover:border-[#2a2a24] dark:hover:border-[#d1d1c1] transition-all uppercase"
            >
              Mode: {theme}
            </button>
            {isAnalyzing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-amber-200/50 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]"></div>
                <span className="text-[9px] mono font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest">
                  Observing...
                </span>
              </div>
            )}
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <div className="max-w-2xl mx-auto w-full py-16 px-8">
            {isCreatingNew ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <textarea
                  autoFocus
                  placeholder="Record reasoning evolution..."
                  className="w-full min-h-[50vh] text-[16px] leading-[1.8] text-[#3a3a34] dark:text-[#d1d1c1] bg-transparent resize-none border-none outline-none placeholder-[#c0beb0]/50 dark:placeholder-white/10 font-light"
                  value={newUpdateText}
                  onChange={(e) => setNewUpdateText(e.target.value)}
                />
                
                <div className="flex items-center justify-end pt-8 border-t border-[#f0eee6] dark:border-white/10">
                  <button
                    disabled={isAnalyzing || !newUpdateText.trim()}
                    onClick={handleCommit}
                    className="px-8 py-3 text-[10px] font-bold mono uppercase tracking-widest bg-[#2a2a24] dark:bg-[#d1d1c1] text-white dark:text-[#121210] hover:bg-black dark:hover:bg-white transition-all disabled:opacity-20"
                  >
                    Commit
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in duration-500">
                {selectedFile?.status === 'contradiction' && (
                  <div className="p-6 bg-amber-50/30 dark:bg-amber-900/10 border-l-2 border-amber-300 dark:border-amber-700 mb-10">
                     <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-3 mono">Observer Note</p>
                     <p className="text-[14px] text-amber-900 dark:text-amber-200 leading-relaxed italic opacity-90">
                        "{selectedFile.contradictsWith}"
                     </p>
                  </div>
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
      <aside className="w-96 bg-[#f4f2eb]/90 dark:bg-[#1a1a16]/90 backdrop-blur-sm flex flex-col h-full border-l border-[#c0beb0]/30 dark:border-white/10 shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
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
