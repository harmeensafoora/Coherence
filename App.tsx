
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

// Define a base date for the demo timeline: Jan 27, 2026
const BASE_DATE = new Date('2026-01-27T09:00:00').getTime();
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

// Common IDs for linking history to files
const R1_ID = 'r1';
const R2_ID = 'r2';
const R3_ID = 'r3';
const R4_ID = 'r4';

const DEFAULT_FOLDERS: Folder[] = [
  {
    id: 'ai-edu-research',
    name: 'AI in Education: Privacy-First Tutors',
    createdAt: BASE_DATE, // Jan 27, 09:00
    lastActive: BASE_DATE + (3 * DAY), // Jan 30
    files: [
      { 
        id: R1_ID, 
        timestamp: BASE_DATE + (2 * HOUR), // Jan 27, 11:00
        filename: 'vision.txt', 
        content: 'Vision: Build a privacy-first AI tutor that runs locally in schools. Goal: 100% student data privacy with zero internet reliance.', 
        status: 'coherent' 
      },
      { 
        id: R2_ID, 
        timestamp: BASE_DATE + DAY + (5 * HOUR), // Jan 28, 14:00
        filename: 'hardware-lock.log', 
        content: 'Constraint: Use cheap school hardware. Approach: 4-bit quantization on local Edge TPUs. No cloud processing allowed.', 
        status: 'coherent' 
      },
      { 
        id: R3_ID, 
        timestamp: BASE_DATE + (2 * DAY) + HOUR, // Jan 29, 10:00
        filename: 'cloud-pivot.txt', 
        content: 'Problem: Local models are too weak for complex math logic. Pivot: Use Cloud API for the reasoning engine to improve student performance scores.', 
        status: 'contradiction', 
        contradictsWith: 'Violates anchor: Privacy-first local processing.' 
      },
      {
        id: R4_ID,
        timestamp: BASE_DATE + (3 * DAY) + (7 * HOUR), // Jan 30, 16:00
        filename: 'resolution.txt',
        content: 'Resolution: Scrap the cloud pivot. We will install one powerful "Private Node" per school to handle complex logic locally. Privacy invariant restored.',
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
      driftDetected: []
    },
    history: [
      {
        id: 's1',
        timestamp: BASE_DATE + (2 * HOUR),
        content: 'Vision: Build a privacy-first AI tutor that runs locally in schools...',
        changeSummary: 'Initial vision for local, private AI tutors established.',
        state: {
          ...INITIAL_STATE,
          anchors: ['Privacy-first local processing', 'Offline-first accessibility', 'Non-identifiable student data collection'],
          intent: ['Develop a privacy-preserving AI tutor'],
        }
      },
      {
        id: 's2',
        timestamp: BASE_DATE + DAY + (5 * HOUR),
        content: 'Constraint: Use cheap school hardware. Approach: 4-bit quantization...',
        changeSummary: 'Defined local hardware constraints and model quantization.',
        state: {
          ...INITIAL_STATE,
          anchors: ['Privacy-first local processing', 'Offline-first accessibility', 'Non-identifiable student data collection'],
          intent: ['Develop a privacy-preserving AI tutor'],
          constraints: ['Must run on low-cost hardware', 'No PII to be transmitted off-device'],
        }
      },
      {
        id: 's3',
        timestamp: BASE_DATE + (2 * DAY) + HOUR,
        content: 'Problem: Local models are too weak for complex math logic. Pivot: Use Cloud API...',
        changeSummary: 'Drift detected: Cloud pivot violates privacy invariant.',
        state: {
          ...INITIAL_STATE,
          anchors: ['Privacy-first local processing', 'Offline-first accessibility', 'Non-identifiable student data collection'],
          intent: ['Improve performance scores via cloud models'],
          constraints: ['Requires persistent internet connection'],
          driftDetected: [{ type: 'anchor_violation', message: 'Cloud API violates privacy anchor.', context: 'cloud-pivot.txt', violatedAnchor: 'Privacy-first local processing' }]
        }
      },
      {
        id: 's4',
        timestamp: BASE_DATE + (3 * DAY) + (7 * HOUR),
        content: 'Resolution: Scrap the cloud pivot. We will install one powerful "Private Node"...',
        changeSummary: 'Coherence restored via local school server strategy.',
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
    name: 'Grad School: Applied AI Scholarships',
    createdAt: BASE_DATE + DAY, // Jan 28, 09:00
    lastActive: BASE_DATE + (3 * DAY) + (5 * HOUR), // Jan 30
    files: [
      { 
        id: 'f1', 
        timestamp: BASE_DATE + DAY + (2 * HOUR), // Jan 28, 11:00
        filename: 'shortlist.txt', 
        content: 'Shortlisting universities with 100% international scholarships: KAIST (Korea), NUS (Singapore), and TUM (Germany). Labs must focus on Applied AI (Robotics or Medical).', 
        status: 'coherent' 
      },
      { 
        id: 'f2', 
        timestamp: BASE_DATE + (2 * DAY) + (3 * HOUR), // Jan 29, 12:00
        filename: 'funding-check.log', 
        content: 'Constraint: Funding is binary. If no full tuition + stipend scholarship is available, the application is discarded. Self-funding is not an option.', 
        status: 'coherent' 
      },
      { 
        id: 'f3', 
        timestamp: BASE_DATE + (3 * DAY) + (5 * HOUR), // Jan 30, 14:00
        filename: 'prestige-drift.txt', 
        content: 'Considering applying to Columbia University for the brand name, even though it costs $60k/year and offers zero international scholarships.', 
        status: 'contradiction', 
        contradictsWith: 'Violates anchor: Only apply if full scholarship is guaranteed.' 
      }
    ],
    state: { 
      ...INITIAL_STATE, 
      anchors: [
        'Only apply if full scholarship is guaranteed',
        'Target labs with Applied AI focus (Real-world impact)',
        'Maintain research alignment over university ranking'
      ],
      intent: ['Secure a fully-funded Masters/PhD in Applied AI at a top global university'],
      constraints: ['No self-funding allowed', 'Must provide monthly living stipend'],
      driftDetected: [{ 
        type: 'anchor_violation', 
        message: 'Self-funded Ivy League interest contradicts scholarship anchor.', 
        context: 'prestige-drift.txt',
        violatedAnchor: 'Only apply if full scholarship is guaranteed'
      }]
    },
    history: []
  },
  {
    id: 'career-2026',
    name: 'Career Direction: AI Engineer Path',
    createdAt: BASE_DATE + (2 * DAY), // Jan 29, 09:00
    lastActive: Date.now(),
    files: [
      { 
        id: 'c1', 
        timestamp: BASE_DATE + (2 * DAY) + HOUR, // Jan 29, 10:00
        filename: 'north-star.txt', 
        content: 'Vision: AI Engineer by 2026. Focus: Moving from "API wrapper" developer to "Systems" engineer. Master inference optimization and custom agent architectures.', 
        status: 'coherent' 
      },
      { 
        id: 'c2', 
        timestamp: BASE_DATE + (3 * DAY) + (2 * HOUR), // Jan 30, 11:00
        filename: 'skills-roadmap.log', 
        content: 'Milestones: 1. Master PyTorch fundamentals. 2. Understand CUDA kernels. 3. Contribute to open-source inference engines (vLLM or Ollama).', 
        status: 'coherent' 
      },
      { 
        id: 'c3', 
        timestamp: Date.now(), // Today
        filename: 'curriculum-drift.md', 
        content: 'Spending next 3 months mastering high-level prompt engineering techniques instead of deep learning math or system internals.', 
        status: 'contradiction', 
        contradictsWith: 'Violates anchor: Prioritize system-level engineering over high-level prompting.'
      }
    ],
    state: { 
      ...INITIAL_STATE, 
      anchors: [
        'Prioritize system-level engineering over high-level prompting',
        'Contribute to open-source AI infrastructure',
        'Deep understanding of model inference vs black-box usage'
      ],
      intent: ['Transition to a core AI Engineering role focused on infrastructure and agents'],
      constraints: ['10 hours/week dedicated to CUDA/PyTorch study', 'Deploy one open-source contribution by Q3'],
      driftDetected: [{
        type: 'anchor_violation',
        message: 'Prompt engineering pivot deviates from core systems focus.',
        context: 'curriculum-drift.md',
        violatedAnchor: 'Prioritize system-level engineering over high-level prompting'
      }]
    },
    history: []
  }
];

const App: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('coherence_v3_folders');
    return saved ? JSON.parse(saved) : DEFAULT_FOLDERS;
  });
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('coherence_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('coherence_v3_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('coherence_theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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
      createdAt: Date.now(),
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
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <Home 
      folders={folders} 
      onSelectFolder={setActiveFolderId} 
      onCreateFolder={createFolder}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
};

export default App;
