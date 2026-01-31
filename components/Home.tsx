
import React, { useState } from 'react';
import { Folder } from '../types';

interface HomeProps {
  folders: Folder[];
  onSelectFolder: (id: string) => void;
  onCreateFolder: (name: string, intent: string, anchors: string[]) => void;
}

const Home: React.FC<HomeProps> = ({ folders, onSelectFolder, onCreateFolder }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIntent, setNewIntent] = useState('');
  const [newAnchors, setNewAnchors] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newIntent.trim()) {
      const anchorsArray = newAnchors
        .split('\n')
        .map(a => a.trim())
        .filter(a => a.length > 0);
        
      onCreateFolder(newName.trim(), newIntent.trim(), anchorsArray);
      setIsCreating(false);
      setNewName('');
      setNewIntent('');
      setNewAnchors('');
    }
  };

  const driftCount = folders.filter(f => f.state.driftDetected.length > 0).length;
  const isFormValid = newName.trim().length > 0 && newIntent.trim().length > 0;

  return (
    <div className="min-h-screen px-12 py-20 flex flex-col items-center relative z-10">
      <div className="w-full max-w-5xl">
        <header className="mb-24 pb-12 border-b border-[#c0beb0]/30 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
          <div className="flex flex-col">
            <h1 className="text-[48px] font-bold tracking-[0.1em] text-[#2a2a24] uppercase leading-none glow-text mono">Coherence</h1>
            <p className="text-[13px] font-medium tracking-[0.35em] text-[#908e7e] uppercase mono mt-3 border-l-2 border-[#2a2a24]/10 pl-4">
              Version control for your thinking
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-3 w-full lg:w-auto">
            <div className="flex gap-3">
              <div className="flex-1 md:w-28 p-4 bg-white/30 border border-[#c0beb0]/20 flex flex-col justify-between group">
                <span className="text-[8px] mono uppercase text-[#b0ae9e] tracking-widest font-bold">Threads</span>
                <span className="text-[18px] mono font-bold text-[#2a2a24]">{folders.length.toString().padStart(2, '0')}</span>
              </div>
              <div className={`flex-1 md:w-28 p-4 bg-white/30 border border-[#c0beb0]/20 flex flex-col justify-between group ${driftCount > 0 ? 'bg-amber-50/20' : ''}`}>
                <span className="text-[8px] mono uppercase text-[#b0ae9e] tracking-widest font-bold">Drifted</span>
                <span className={`text-[18px] mono font-bold ${driftCount > 0 ? 'text-[#fbbf24]' : 'text-[#b0ae9e]'}`}>
                  {driftCount.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {!isCreating && (
              <button 
                onClick={() => setIsCreating(true)}
                className="px-6 py-4 mono text-[10px] font-bold uppercase tracking-[0.2em] bg-[#2a2a24] text-white hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <span>+ Create Thread</span>
              </button>
            )}
          </div>
        </header>

        {isCreating && (
          <div className="mb-20 p-10 bg-white/40 border border-dashed border-[#c0beb0]/50 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-[10px] font-bold mono uppercase tracking-[0.3em] text-[#908e7e] mb-8">Thread Allocation</h2>
            <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[9px] mono uppercase font-bold text-[#b0ae9e] tracking-widest">Thread Identifier (Name)</label>
                    <input 
                      autoFocus
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. SYSTEMS_REDESIGN_01"
                      className="w-full bg-white/60 border border-[#c0beb0]/40 p-4 mono text-[13px] outline-none focus:border-[#2a2a24] transition-all"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[9px] mono uppercase font-bold text-[#b0ae9e] tracking-widest">
                      Core Intent <span className="text-red-400 font-bold">*</span>
                    </label>
                    <textarea 
                      value={newIntent}
                      onChange={(e) => setNewIntent(e.target.value)}
                      placeholder="What is the high-level purpose of this thread?"
                      className="w-full h-32 bg-white/60 border border-[#c0beb0]/40 p-4 mono text-[13px] outline-none focus:border-[#2a2a24] transition-all resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2 h-full flex flex-col">
                    <label className="block text-[9px] mono uppercase font-bold text-[#b0ae9e] tracking-widest">
                      Anchors (Optional, one per line)
                    </label>
                    <textarea 
                      value={newAnchors}
                      onChange={(e) => setNewAnchors(e.target.value)}
                      placeholder="Define invariants Coherence must protect..."
                      className="w-full flex-1 min-h-[14rem] bg-white/60 border border-[#c0beb0]/40 p-4 mono text-[13px] outline-none focus:border-[#2a2a24] transition-all resize-none"
                    />
                    <p className="text-[8px] mono text-[#c0beb0] mt-2 italic">
                      Anchors are permanent invariants that Coherence monitors for violations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-6 border-t border-[#c0beb0]/20">
                <button 
                  type="submit" 
                  disabled={!isFormValid}
                  className="px-10 py-4 mono text-[10px] font-bold uppercase tracking-widest bg-[#2a2a24] text-white hover:bg-black transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Mount Thread
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="text-[10px] mono text-[#908e7e] hover:text-[#2a2a24] font-bold uppercase tracking-widest transition-colors"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map(folder => {
            const hasDrift = folder.state.driftDetected.length > 0;
            const isUninitialized = folder.files.length === 0;
            const lastActiveDate = new Date(folder.lastActive).toLocaleDateString([], { 
              year: 'numeric', month: '2-digit', day: '2-digit' 
            });
            
            return (
              <button
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                className="p-6 text-left bg-white/50 border border-[#c0beb0]/20 transition-all hover:bg-white hover:border-[#2a2a24]/20 group relative flex flex-col min-h-[11rem]"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                     <span className="text-2xl text-[#b0ae9e] group-hover:text-[#2a2a24] transition-colors mt-0.5">📁</span>
                     <div className="flex flex-col">
                        <span className="text-[8px] mono text-[#c0beb0] font-bold tracking-[0.2em] mb-0.5">LOC: {folder.id.slice(0, 8)}</span>
                        <h3 className="text-[15px] font-bold text-[#2a2a24] uppercase mono tracking-tight leading-tight group-hover:underline underline-offset-4">
                          {folder.name}
                        </h3>
                     </div>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full border border-white mt-1.5 ${isUninitialized ? 'bg-slate-200' : hasDrift ? 'bg-[#fbbf24]' : 'bg-[#4ade80]'}`}></div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-[#f0eee6] flex items-center justify-between">
                  <span className="text-[8px] mono text-[#b0ae9e] font-bold uppercase tracking-widest">
                    Access: {lastActiveDate}
                  </span>
                  <span className={`text-[8px] mono font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded-sm ${hasDrift ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                    {isUninitialized ? 'Pending' : hasDrift ? 'Drifted' : 'Stable'}
                  </span>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
                   <span className="text-[7px] mono font-bold uppercase tracking-widest text-[#2a2a24]">Mount &rarr;</span>
                </div>
              </button>
            );
          })}
        </div>

        <footer className="mt-40 text-center pb-12 opacity-20">
          <p className="text-[9px] mono text-[#b0ae9e] tracking-[0.4em] font-bold uppercase">
            Observer Protocol 3.0 // State Persistent
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
