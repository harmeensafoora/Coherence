
import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import FolderView from './components/FolderView';
import { Folder, ReasoningState, Snapshot, FileEntry } from './types';

const INITIAL_STATE: ReasoningState = {
  assumptions: [],
  intent: [],
  constraints: [],
  anchors: [],
  conclusions: [],
  driftDetected: []
};

// Common IDs for linking history to files
const R1_ID = 'r1';
const R2_ID = 'r2';
const R3_ID = 'r3';
const R4_ID = 'r4';

const DEFAULT_FOLDERS: Folder[] = [
  {
    id: 'ai-edu-research',
    name: 'AI in Education: Privacy-First Tutors',
    lastActive: Date.now(),
    files: [
      { 
        id: R1_ID, 
        timestamp: Date.now() - 15000000, 
        filename: 'research-proposal.txt', 
        content: 'Final year thesis proposal: Investigating the efficacy of offline-first AI tutors in primary education. Core hypothesis: Local inference maintains student privacy while providing 24/7 access without internet dependencies.', 
        status: 'coherent' 
      },
      { 
        id: R2_ID, 
        timestamp: Date.now() - 10000000, 
        filename: 'tech-stack-definition.log', 
        content: 'Technical constraints: Using Edge TPUs for local inference. Models must be quantized to 4-bit to fit on consumer hardware available in underfunded schools.', 
        status: 'coherent' 
      },
      { 
        id: R3_ID, 
        timestamp: Date.now() - 5000000, 
        filename: 'multimodal-pivot.txt', 
        content: 'Realized that local 4-bit models struggle with complex pedagogical reasoning. Decided to integrate a high-capacity cloud API for the reasoning engine to improve test scores, even if it requires a persistent internet connection and data offloading.', 
        status: 'contradiction', 
        contradictsWith: 'Violates anchor: Privacy-first local processing.' 
      },
      {
        id: R4_ID,
        timestamp: Date.now() - 1000000,
        filename: 'privacy-alignment-resolution.txt',
        content: 'Correcting course after evaluating the drift. We will not use public cloud APIs. Instead, we are implementing a "Privileged Intranet Node" — a single high-performance server per school that runs a local unquantized model for complex reasoning. This restores our privacy invariant while solving the reasoning bottleneck.',
        status: 'coherent'
      }
    ],
    state: { 
      ...INITIAL_STATE, 
      anchors: [
        'Privacy-first local processing',
        'Offline-first accessibility for underfunded regions',
        'Non-identifiable student data collection'
      ],
      intent: ['Develop a privacy-preserving AI tutor using local Intranet nodes for complex reasoning'],
      constraints: ['Must run on low-cost hardware', 'No PII to be transmitted off-device', 'Single server per school requirement'],
      driftDetected: [] // Drift resolved in the latest state
    },
    history: [
      {
        id: 's1',
        timestamp: Date.now() - 15000000,
        content: 'Final year thesis proposal: Investigating the efficacy of offline-first AI tutors in primary education...',
        changeSummary: 'Initial research proposal established.',
        state: {
          ...INITIAL_STATE,
          anchors: ['Privacy-first local processing', 'Offline-first accessibility', 'Non-identifiable student data collection'],
          intent: ['Develop a privacy-preserving AI tutor'],
        }
      },
      {
        id: 's2',
        timestamp: Date.now() - 10000000,
        content: 'Technical constraints: Using Edge TPUs for local inference...',
        changeSummary: 'Technical hardware constraints defined.',
        state: {
          ...INITIAL_STATE,
          anchors: ['Privacy-first local processing', 'Offline-first accessibility', 'Non-identifiable student data collection'],
          intent: ['Develop a privacy-preserving AI tutor'],
          constraints: ['Must run on low-cost hardware', 'No PII to be transmitted off-device'],
        }
      },
      {
        id: 's3',
        timestamp: Date.now() - 5000000,
        content: 'Realized that local 4-bit models struggle... integrating cloud API...',
        changeSummary: 'Drift detected: Cloud API integration pivot.',
        state: {
          ...INITIAL_STATE,
          anchors: ['Privacy-first local processing', 'Offline-first accessibility', 'Non-identifiable student data collection'],
          intent: ['Improve test scores via high-capacity models'],
          constraints: ['Requires persistent internet connection'],
          driftDetected: [{ type: 'anchor_violation', message: 'Cloud API violates privacy anchor.', context: 'multimodal-pivot.txt', violatedAnchor: 'Privacy-first local processing' }]
        }
      },
      {
        id: 's4',
        timestamp: Date.now() - 1000000,
        content: 'Correcting course... implementing "Privileged Intranet Node"...',
        changeSummary: 'Coherence restored via private local server strategy.',
        state: {
          ...INITIAL_STATE,
          anchors: ['Privacy-first local processing', 'Offline-first accessibility', 'Non-identifiable student data collection'],
          intent: ['Develop a privacy-preserving AI tutor using local Intranet nodes'],
          constraints: ['Must run on low-cost hardware', 'No PII to be transmitted off-device', 'Single server per school requirement'],
          driftDetected: []
        }
      }
    ]
  },
  {
    id: 'grad-school',
    name: 'Grad School Applications',
    lastActive: Date.now() - 43200000,
    files: [
      { id: 'f1', timestamp: Date.now() - 50000000, filename: 'initial-scope.txt', content: 'Starting the grad school search. Looking at top HCI schools globally.', status: 'coherent' },
      { id: 'f2', timestamp: Date.now() - 40000000, filename: 'faculty-shortlist.log', content: 'Deep dive into faculty. MIT, CMU, and ETH Zurich seem like perfect matches for interactive hardware research.', status: 'coherent' },
      { id: 'f3', timestamp: Date.now() - 30000000, filename: 'prestige-pivot.txt', content: 'Considering adding Stanford and Berkeley just for the ranking, even though the specific lab alignment is lower and funding is more competitive.', status: 'contradiction', contradictsWith: 'Violates anchor: Prioritize faculty alignment over rankings.' }
    ],
    state: { 
      ...INITIAL_STATE, 
      anchors: [
        'Target only research-focused universities',
        'Avoid programs without funded PhD tracks',
        'Prioritize faculty alignment over rankings'
      ],
      intent: ['Apply to top 5 HCI programs with strong research alignment'],
      constraints: ['GRE score due by Oct 15', 'Portfolio lock: Dec 1'],
      driftDetected: [{ 
        type: 'anchor_violation', 
        message: 'Ranking priority contradicts faculty alignment anchor.', 
        context: 'prestige-pivot.txt',
        violatedAnchor: 'Prioritize faculty alignment over rankings'
      }]
    },
    history: []
  },
  {
    id: 'career-2026',
    name: 'Career Direction 2026',
    lastActive: Date.now(),
    files: [
      { 
        id: 'c1', 
        timestamp: Date.now() - 20000000, 
        filename: 'vision-statement.txt', 
        content: 'Long-term goal: Transition from general software engineering to applied AI research. I want to build systems that exhibit high-level reasoning rather than just pattern matching. Autonomy and agency are the key themes.', 
        status: 'coherent' 
      },
      { 
        id: 'c2', 
        timestamp: Date.now() - 15000000, 
        filename: 'skill-gap-audit.log', 
        content: 'Current skills: TS, React, Node. Gaps: PyTorch, distributed training, agentic frameworks (LangGraph/AutoGPT internals). Need to commit 10 hours/week to deep learning fundamentals.', 
        status: 'coherent' 
      },
      { 
        id: 'c3', 
        timestamp: Date.now() - 10000000, 
        filename: 'reading-list-q1.txt', 
        content: 'Core Reading List:\n1. ReAct: Synergizing Reasoning and Acting in Language Models\n2. Toolformer: Language Models Can Teach Themselves to Use Tools\n3. Voyager: An Open-Ended Embodied Layer with Large Language Models.', 
        status: 'coherent' 
      },
      { 
        id: 'c4', 
        timestamp: Date.now() - 5000000, 
        filename: 'lab-outreach-status.md', 
        content: 'Status of networking: Reached out to two researchers at Stanford Human-AI Interaction lab. One positive response regarding their open-source agent platform. Goal: Contribute a significant PR by end of Q2.', 
        status: 'coherent' 
      }
    ],
    state: { 
      ...INITIAL_STATE, 
      anchors: [
        'Never compromise on creative autonomy',
        'Favor long-term learning over short-term salary',
        'Stay close to research and exploration'
      ],
      intent: ['Transition to applied research roles in agentic AI by Q3 2026'],
      assumptions: ['Remote work remains standard', 'Industry shift towards agentic AI'],
      constraints: ['10 hours/week study commitment', 'PR contribution to research lab by Q2'],
      conclusions: ['Focusing on ReAct and Tool-use frameworks as the primary learning pillar.']
    },
    history: [
      {
        id: 'cs1',
        timestamp: Date.now() - 20000000,
        content: 'Long-term goal: Transition from general software engineering...',
        changeSummary: 'Vision for 2026 defined.',
        state: {
          ...INITIAL_STATE,
          anchors: ['Never compromise on creative autonomy', 'Favor long-term learning over salary', 'Stay close to research'],
          intent: ['Transition to applied AI research'],
        }
      },
      {
        id: 'cs2',
        timestamp: Date.now() - 15000000,
        content: 'Current skills: TS, React, Node. Gaps: PyTorch...',
        changeSummary: 'Skill gap analysis and study constraints added.',
        state: {
          ...INITIAL_STATE,
          anchors: ['Never compromise on creative autonomy', 'Favor long-term learning over salary', 'Stay close to research'],
          intent: ['Transition to applied AI research'],
          constraints: ['10 hours/week study commitment'],
        }
      },
      {
        id: 'cs3',
        timestamp: Date.now() - 10000000,
        content: 'Core Reading List: 1. ReAct, 2. Toolformer...',
        changeSummary: 'Curriculum established for autonomous agent study.',
        state: {
          ...INITIAL_STATE,
          anchors: ['Never compromise on creative autonomy', 'Favor long-term learning over salary', 'Stay close to research'],
          intent: ['Transition to applied AI research'],
          constraints: ['10 hours/week study commitment'],
          assumptions: ['Industry shift towards agentic AI'],
        }
      },
      {
        id: 'cs4',
        timestamp: Date.now() - 5000000,
        content: 'Status of networking: Reached out to Stanford...',
        changeSummary: 'Active outreach and contribution goals established.',
        state: {
          ...INITIAL_STATE,
          anchors: ['Never compromise on creative autonomy', 'Favor long-term learning over salary', 'Stay close to research'],
          intent: ['Transition to applied AI research'],
          constraints: ['10 hours/week study commitment', 'PR contribution by Q2'],
          assumptions: ['Industry shift towards agentic AI'],
          conclusions: ['Focusing on ReAct and Tool-use as primary pillars.']
        }
      }
    ]
  }
];

const App: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('coherence_v3_folders');
    return saved ? JSON.parse(saved) : DEFAULT_FOLDERS;
  });
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('coherence_v3_folders', JSON.stringify(folders));
  }, [folders]);

  const activeFolder = folders.find(f => f.id === activeFolderId);

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates, lastActive: Date.now() } : f));
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setActiveFolderId(null);
  };

  const createFolder = (name: string, intent: string, anchors: string[]) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      lastActive: Date.now(),
      files: [],
      state: { 
        ...INITIAL_STATE,
        intent: [intent],
        anchors: anchors
      },
      history: []
    };
    setFolders(prev => [newFolder, ...prev]);
    setActiveFolderId(newFolder.id);
  };

  if (activeFolderId && activeFolder) {
    return (
      <FolderView 
        folder={activeFolder} 
        onBack={() => setActiveFolderId(null)} 
        onUpdate={(updates) => updateFolder(activeFolder.id, updates)}
        onDeleteFolder={() => deleteFolder(activeFolder.id)}
      />
    );
  }

  return (
    <Home 
      folders={folders} 
      onSelectFolder={setActiveFolderId} 
      onCreateFolder={createFolder}
    />
  );
};

export default App;
