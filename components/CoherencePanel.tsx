
import React, { useState, useMemo } from 'react';
import { ReasoningState, Snapshot, DriftItem } from '../types';

interface CoherencePanelProps {
  state: ReasoningState;
  history: Snapshot[];
  isAnalyzing: boolean;
  folderName: string;
  onAddAnchor?: (anchor: string) => void;
  onDeleteAnchor?: (anchor: string) => void;
  onDeleteSnapshot?: (id: string) => void;
  onDeleteFolder?: () => void;
}

const SubDirectory: React.FC<{ 
  title: string; 
  items: string[]; 
  isAnchor?: boolean;
  violatedAnchors?: string[];
  drifts?: DriftItem[];
  onAddClick?: () => void;
  onDeleteAnchor?: (anchor: string) => void;
}> = ({ title, items, isAnchor = false, violatedAnchors = [], drifts = [], onAddClick, onDeleteAnchor }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  if (items.length === 0 && !isAnchor) return null;

  return (
    <div className="mb-3">
      <div 
        className="flex items-center justify-between py-1.5 cursor-pointer group px-4 -mx-4 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[14px] opacity-70">📁</span>
          <span className="text-[11px] font-bold mono uppercase tracking-[0.12em] text-[#2a2a24] dark:text-[#d1d1c1]">
            {title}
            <span className="ml-2 opacity-30 font-normal">({items.length})</span>
          </span>
          <span className={`text-[7px] mono transition-transform duration-200 text-[#908e7e] dark:text-[#7a786a] ml-1 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
        {isAnchor && onAddClick && (
          <button 
            onClick={(e) => { e.stopPropagation(); onAddClick(); }}
            className="text-[9px] font-bold text-[#2a2a24] dark:text-[#d1d1c1] opacity-20 hover:opacity-100 transition-opacity mono px-2"
          >
            [+]
          </button>
        )}
      </div>

      {isOpen && (
        <div className="ml-2.5 border-l border-[#c0beb0]/40 dark:border-white/10 pl-5 py-1 space-y-1.5">
          {isAnchor && drifts.length > 0 && (
            <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-left-1">
              {drifts.map((drift, idx) => (
                <div key={idx} className="bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200/40 dark:border-amber-900/30 p-3 rounded-sm">
                   <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[9px] mono font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest">Drifted</span>
                   </div>
                   <p className="text-[11px] text-[#2a2a24] dark:text-amber-200 italic leading-tight">{drift.message}</p>
                </div>
              ))}
            </div>
          )}

          {items.length === 0 && isAnchor && drifts.length === 0 && (
            <div className="text-[10px] mono text-[#c0beb0] dark:text-[#7a786a] italic py-1">Empty_Set</div>
          )}
          
          {items.map((item, i) => {
            const isViolated = isAnchor && violatedAnchors.includes(item);
            return (
              <div 
                key={i} 
                className={`group/item text-[11px] leading-snug flex items-center py-0.5 rounded-sm transition-none ${
                  isViolated 
                    ? 'text-amber-800 dark:text-amber-500 font-medium' 
                    : 'text-[#4a483a] dark:text-[#b0ae9e]'
                }`}
              >
                <span className="mr-3 opacity-30 mono text-[9px] mt-0.5">/</span>
                <span className="flex-1 tracking-tight">{item}</span>
                {isAnchor && onDeleteAnchor && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteAnchor(item); }}
                    className="opacity-0 group-hover/item:opacity-30 hover:!opacity-100 text-red-600 mono text-[9px] px-2"
                  >
                    [del]
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CoherencePanel: React.FC<CoherencePanelProps> = ({ 
  state: currentState, 
  history, 
  folderName,
  onAddAnchor, 
  onDeleteAnchor,
  onDeleteSnapshot,
  onDeleteFolder
}) => {
  const [selectionIds, setSelectionIds] = useState<string[]>([]);
  const [isAddingAnchor, setIsAddingAnchor] = useState(false);
  const [newAnchorText, setNewAnchorText] = useState('');
  
  // Red Zone State
  const [redZoneView, setRedZoneView] = useState<'closed' | 'menu' | 'anchors' | 'commits' | 'thread'>('closed');
  const [deleteTaskInput, setDeleteTaskInput] = useState('');
  const [confirmingItem, setConfirmingItem] = useState<string | null>(null);

  const sortedSelectedSnapshots = useMemo(() => {
    return selectionIds
      .map(id => history.find(s => s.id === id))
      .filter((s): s is Snapshot => !!s)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [selectionIds, history]);

  const isDiffMode = sortedSelectedSnapshots.length === 2;
  const isViewingHistory = sortedSelectedSnapshots.length === 1 && !isDiffMode;
  
  const viewState = isViewingHistory ? sortedSelectedSnapshots[0].state : currentState;
  const activeDrift = viewState.driftDetected || [];
  const hasDrift = activeDrift.length > 0;
  
  const violatedAnchors = useMemo(() => 
    activeDrift
      .filter(d => d.type === 'anchor_violation' && d.violatedAnchor)
      .map(d => d.violatedAnchor!)
    , [activeDrift]
  );

  const toggleSnapshotSelection = (id: string) => {
    setSelectionIds(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleAddAnchor = () => {
    if (newAnchorText.trim() && onAddAnchor) {
      onAddAnchor(newAnchorText.trim());
      setNewAnchorText('');
      setIsAddingAnchor(false);
    }
  };

  const handlePurgeThread = () => {
    if (deleteTaskInput === folderName && onDeleteFolder) {
      onDeleteFolder();
    }
  };

  const handleConfirmAnchorDelete = (anchor: string) => {
    if (onDeleteAnchor) {
      onDeleteAnchor(anchor);
      setConfirmingItem(null);
    }
  };

  const handleConfirmSnapshotDelete = (id: string) => {
    if (onDeleteSnapshot) {
      onDeleteSnapshot(id);
      setConfirmingItem(null);
    }
  };

  return (
    <div className="flex flex-col h-full relative transition-colors duration-300">
      <header className="px-6 py-6 flex items-center justify-between border-b border-[#c0beb0]/20 dark:border-white/10 bg-[#f4f2eb]/60 dark:bg-[#1a1a16]/60">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold mono tracking-[0.2em] text-[#908e7e] dark:text-[#7a786a] uppercase italic">Coherence Monitor</span>
          {(isDiffMode || isViewingHistory) && (
            <div className="flex items-center gap-2">
              <span className="text-[8px] mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest bg-[#2a2a24] dark:bg-[#d1d1c1] text-white dark:text-[#121210]">
                {isDiffMode ? 'Evolution Map' : 'Snapshot View'}
              </span>
            </div>
          )}
        </div>
        {(isViewingHistory || isDiffMode) && (
          <button 
            onClick={() => setSelectionIds([])}
            className="text-[9px] px-2 py-1 mono text-[#2a2a24] dark:text-[#d1d1c1] border border-[#2a2a24]/20 dark:border-white/10 hover:bg-[#2a2a24] dark:hover:bg-[#d1d1c1] hover:text-white dark:hover:text-[#121210] transition-all uppercase rounded-sm"
          >
            Reset
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-8">
        <div className="space-y-2">
          {isAddingAnchor && (
            <div className="mb-6 p-4 bg-white/80 dark:bg-white/5 border border-[#c0beb0]/40 dark:border-white/10 rounded-sm shadow-sm animate-in slide-in-from-top-1">
              <p className="text-[9px] mono font-bold text-[#b0ae9e] dark:text-[#7a786a] mb-2 uppercase tracking-widest">Declare Anchor</p>
              <textarea 
                autoFocus
                value={newAnchorText}
                onChange={(e) => setNewAnchorText(e.target.value)}
                className="w-full text-[11px] bg-transparent border-none focus:ring-0 resize-none p-0 mono placeholder-[#c0beb0]/70 dark:text-[#d1d1c1]"
                placeholder="Define invariant..."
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddAnchor())}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setIsAddingAnchor(false)} className="text-[9px] mono text-[#908e7e] dark:text-[#7a786a] uppercase hover:text-[#2a2a24] dark:hover:text-[#d1d1c1]">Discard</button>
                <button onClick={handleAddAnchor} className="text-[9px] mono font-bold text-[#2a2a24] dark:text-[#d1d1c1] uppercase border border-[#2a2a24]/20 dark:border-white/10 px-2 py-1 rounded-sm">Add</button>
              </div>
            </div>
          )}

          <SubDirectory 
            title="Anchors" 
            items={viewState.anchors} 
            isAnchor 
            violatedAnchors={violatedAnchors} 
            drifts={activeDrift}
            onAddClick={() => setIsAddingAnchor(true)}
            onDeleteAnchor={onDeleteAnchor}
          />
          <SubDirectory title="Core Intent" items={viewState.intent} />
          <SubDirectory title="Constraints" items={viewState.constraints} />
        </div>

        {/* Timeline Section */}
        <div className="mt-16 mb-12">
          <div className="flex items-center gap-2.5 mb-8">
            <span className="text-sm opacity-60">📜</span>
            <span className="text-[10px] font-bold mono uppercase tracking-[0.25em] text-[#2a2a24] dark:text-[#d1d1c1]">Timeline</span>
          </div>
          
          <div className="relative border-l border-[#c0beb0]/30 dark:border-white/10 ml-2 pl-5 space-y-8">
            <button 
              onClick={() => setSelectionIds([])}
              className={`text-left block w-full transition-opacity ${selectionIds.length === 0 ? 'opacity-100' : 'opacity-30'}`}
            >
              <div className={`absolute -left-[0.35rem] w-2.5 h-2.5 rounded-full border border-white dark:border-black transition-all ${selectionIds.length === 0 ? 'bg-[#4ade80]' : 'bg-[#c0beb0] dark:bg-[#7a786a]'}`} />
              <div className="text-[10px] font-bold text-[#2a2a24] dark:text-[#d1d1c1] mono uppercase tracking-widest">Live_State</div>
              <div className="text-[8px] text-[#b0ae9e] dark:text-[#7a786a] mono mt-0.5 tracking-tight uppercase font-medium">Active</div>
            </button>

            {history.slice().reverse().map((s) => {
              const isSelected = selectionIds.includes(s.id);
              const hasDriftAtSnapshot = s.state.driftDetected.length > 0;
              return (
                <div key={s.id} className="group relative">
                  <button 
                    onClick={() => toggleSnapshotSelection(s.id)}
                    className={`text-left block w-full transition-opacity relative group ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                  >
                    <div className={`absolute -left-[1.35rem] w-2 h-2 rounded-full border border-white dark:border-black transition-all ${
                      isSelected ? 'bg-[#2a2a24] dark:bg-[#d1d1c1]' : hasDriftAtSnapshot ? 'bg-amber-400' : 'bg-[#c0beb0]/80 dark:bg-[#7a786a]'
                    }`} />
                    <div className="text-[9px] text-[#908e7e] dark:text-[#7a786a] mono tracking-widest uppercase mb-1">
                      Snapshot_{new Date(s.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}
                    </div>
                    <div className="text-[11px] text-[#2a2a24] dark:text-[#d1d1c1] truncate tracking-tight font-medium uppercase mono max-w-[85%]">
                      {s.changeSummary}
                    </div>
                  </button>
                  {onDeleteSnapshot && (
                    <button 
                      onClick={() => onDeleteSnapshot(s.id)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 hover:!opacity-100 text-red-600 mono text-[8px] uppercase tracking-widest"
                    >
                      [purge]
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RED ZONE: Thread Destruction & Pruning */}
        <div className="mt-24 pt-8 border-t border-red-200/30 dark:border-red-900/10">
           <div className="flex items-center gap-2.5 mb-6">
             <span className="text-sm">☢️</span>
             <span className="text-[10px] font-bold mono uppercase tracking-[0.25em] text-red-600">Red Zone</span>
           </div>

           {redZoneView === 'closed' && (
             <button 
               onClick={() => setRedZoneView('menu')}
               className="w-full py-3 text-[9px] mono font-bold text-red-400 dark:text-red-500 uppercase tracking-widest border border-dashed border-red-200/50 dark:border-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/5 transition-colors"
             >
               Enter Maintenance Protocol
             </button>
           )}

           {redZoneView === 'menu' && (
             <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <button onClick={() => setRedZoneView('anchors')} className="w-full text-left p-3 text-[10px] mono font-bold uppercase tracking-widest text-[#2a2a24] dark:text-[#d1d1c1] bg-white dark:bg-white/5 border border-[#c0beb0]/30 dark:border-white/10 hover:border-red-300 dark:hover:border-red-700 transition-colors flex justify-between">
                  <span>Prune Anchors</span>
                  <span className="opacity-30">&rarr;</span>
                </button>
                <button onClick={() => setRedZoneView('commits')} className="w-full text-left p-3 text-[10px] mono font-bold uppercase tracking-widest text-[#2a2a24] dark:text-[#d1d1c1] bg-white dark:bg-white/5 border border-[#c0beb0]/30 dark:border-white/10 hover:border-red-300 dark:hover:border-red-700 transition-colors flex justify-between">
                  <span>Purge Snapshots</span>
                  <span className="opacity-30">&rarr;</span>
                </button>
                <button onClick={() => setRedZoneView('thread')} className="w-full text-left p-3 text-[10px] mono font-bold uppercase tracking-widest text-red-600 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex justify-between">
                  <span>Destroy Thread</span>
                  <span className="opacity-30">&rarr;</span>
                </button>
                <button onClick={() => setRedZoneView('closed')} className="w-full py-2 text-[8px] mono font-bold uppercase text-[#c0beb0] dark:text-[#7a786a] text-center mt-2">Abort Maintenance</button>
             </div>
           )}

           {redZoneView === 'anchors' && (
             <div className="space-y-4 animate-in fade-in duration-200">
               <div className="flex items-center justify-between">
                 <h4 className="text-[9px] mono font-bold uppercase text-red-600 tracking-[0.15em]">Anchor Pruning</h4>
                 <button onClick={() => {setRedZoneView('menu'); setConfirmingItem(null);}} className="text-[9px] mono text-[#908e7e] dark:text-[#7a786a] uppercase hover:text-[#2a2a24] dark:hover:text-[#d1d1c1] transition-colors font-bold">Back</button>
               </div>
               <div className="space-y-1.5 max-h-64 overflow-y-auto hide-scrollbar pr-2">
                 {currentState.anchors.length === 0 ? (
                   <div className="text-[10px] mono text-[#c0beb0] dark:text-[#7a786a] italic py-4 border border-dashed border-[#c0beb0]/30 dark:border-white/10 text-center">No active anchors.</div>
                 ) : (
                   currentState.anchors.map((a, i) => (
                    <div key={i} className={`p-3 border transition-all ${confirmingItem === `a-${i}` ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40' : 'bg-white dark:bg-white/5 border-[#c0beb0]/20 dark:border-white/10 hover:border-[#c0beb0]/50 dark:hover:border-white/20'}`}>
                      <div className="flex items-start gap-3">
                        <p className="flex-1 text-[11px] leading-tight text-[#4a483a] dark:text-[#b0ae9e]">{a}</p>
                        {confirmingItem === `a-${i}` ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleConfirmAnchorDelete(a)} className="text-[9px] mono font-black text-red-600 dark:text-red-500 hover:underline">YES</button>
                            <button onClick={() => setConfirmingItem(null)} className="text-[9px] mono text-[#908e7e] dark:text-[#7a786a] font-bold">NO</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmingItem(`a-${i}`)} className="text-[9px] mono text-red-400 dark:text-red-500 uppercase font-bold opacity-60 hover:opacity-100 transition-opacity mt-0.5">Purge</button>
                        )}
                      </div>
                    </div>
                   ))
                 )}
               </div>
             </div>
           )}

           {redZoneView === 'commits' && (
             <div className="space-y-4 animate-in fade-in duration-200">
               <div className="flex items-center justify-between">
                 <h4 className="text-[9px] mono font-bold uppercase text-red-600 tracking-[0.15em]">Snapshot Ledger</h4>
                 <button onClick={() => {setRedZoneView('menu'); setConfirmingItem(null);}} className="text-[9px] mono text-[#908e7e] dark:text-[#7a786a] uppercase hover:text-[#2a2a24] dark:hover:text-[#d1d1c1] transition-colors font-bold">Back</button>
               </div>
               <div className="space-y-1.5 max-h-64 overflow-y-auto hide-scrollbar pr-2">
                 {history.length === 0 ? (
                   <div className="text-[10px] mono text-[#c0beb0] dark:text-[#7a786a] italic py-4 border border-dashed border-[#c0beb0]/30 dark:border-white/10 text-center">Empty history.</div>
                 ) : (
                   history.slice().reverse().map((s) => (
                    <div key={s.id} className={`p-3 border transition-all ${confirmingItem === s.id ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40' : 'bg-white dark:bg-white/5 border-[#c0beb0]/20 dark:border-white/10 hover:border-[#c0beb0]/50 dark:hover:border-white/20'}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[8px] mono text-[#b0ae9e] dark:text-[#7a786a] font-bold uppercase">ID: {s.id.slice(0,6)}</span>
                            <span className="text-[8px] mono text-[#b0ae9e] dark:text-[#7a786a] opacity-40">|</span>
                            <span className="text-[8px] mono text-[#b0ae9e] dark:text-[#7a786a] font-bold">
                              {new Date(s.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}
                            </span>
                          </div>
                          <p className={`text-[11px] leading-snug font-medium uppercase mono truncate ${confirmingItem === s.id ? 'text-red-900 dark:text-red-500' : 'text-[#2a2a24] dark:text-[#d1d1c1]'}`}>
                            {s.changeSummary}
                          </p>
                        </div>
                        {confirmingItem === s.id ? (
                          <div className="flex flex-col gap-1 items-end pt-1">
                            <button onClick={() => handleConfirmSnapshotDelete(s.id)} className="text-[9px] mono font-black text-red-600 dark:text-red-500 hover:underline">PURGE</button>
                            <button onClick={() => setConfirmingItem(null)} className="text-[9px] mono text-[#908e7e] dark:text-[#7a786a] font-bold">KEEP</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmingItem(s.id)} className="text-[9px] mono text-red-400 dark:text-red-500 uppercase font-bold opacity-60 hover:opacity-100 transition-opacity mt-2.5">Drop</button>
                        )}
                      </div>
                    </div>
                   ))
                 )}
               </div>
             </div>
           )}

           {redZoneView === 'thread' && (
             <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
               <div className="flex items-center justify-between mb-2">
                 <h4 className="text-[9px] mono font-bold uppercase text-red-600 tracking-[0.15em]">Terminal Destruction</h4>
                 <button onClick={() => {setRedZoneView('menu'); setDeleteTaskInput('');}} className="text-[9px] mono text-[#908e7e] dark:text-[#7a786a] uppercase hover:text-[#2a2a24] dark:hover:text-[#d1d1c1] transition-colors font-bold">Back</button>
               </div>
               <p className="text-[10px] text-red-700 dark:text-red-500 leading-relaxed mono italic border-l-2 border-red-200 dark:border-red-900 pl-3">
                 Validate destruction by entering: <span className="font-bold underline text-red-900 dark:text-red-400 bg-red-50 dark:bg-red-950 px-1">{folderName}</span>
               </p>
               <input 
                 autoFocus
                 type="text"
                 value={deleteTaskInput}
                 onChange={(e) => setDeleteTaskInput(e.target.value)}
                 className="w-full bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-[12px] mono text-red-900 dark:text-red-500 outline-none focus:border-red-500 shadow-inner"
                 placeholder="Identifier verification..."
               />
               <div className="flex gap-2">
                 <button 
                   disabled={deleteTaskInput !== folderName}
                   onClick={handlePurgeThread}
                   className="flex-1 py-4 text-[9px] mono font-black bg-red-600 dark:bg-red-700 text-white uppercase tracking-widest disabled:opacity-20 transition-all hover:bg-red-700 dark:hover:bg-red-800 shadow-md"
                 >
                   Execute Purge
                 </button>
                 <button 
                   onClick={() => { setRedZoneView('menu'); setDeleteTaskInput(''); }}
                   className="px-6 py-4 text-[9px] mono font-bold text-[#908e7e] dark:text-[#7a786a] uppercase tracking-widest hover:text-[#2a2a24] dark:hover:text-[#d1d1c1] transition-colors"
                 >
                   Cancel
                 </button>
               </div>
             </div>
           )}
        </div>
      </div>

      <footer className="p-6 border-t border-[#c0beb0]/20 dark:border-white/10 bg-[#f4f2eb]/60 dark:bg-[#1a1a16]/60 backdrop-blur-sm sticky bottom-0">
        <div className="flex items-center justify-between text-[10px] mono text-[#908e7e] dark:text-[#7a786a] font-bold uppercase tracking-[0.15em]">
           <span>Coherence Status</span>
           <span className={`transition-colors duration-700 flex items-center gap-1.5 ${hasDrift ? 'text-amber-600' : 'text-[#4ade80]'}`}>
            <span className={`w-1 h-1 rounded-full ${hasDrift ? 'bg-amber-400 animate-pulse' : 'bg-[#4ade80]'}`}></span>
            {hasDrift ? 'Drifted' : 'Stable'}
           </span>
        </div>
      </footer>
    </div>
  );
};

export default CoherencePanel;
