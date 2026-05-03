import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Home from './components/Home';
import FolderView from './components/FolderView';
import LoginScreen from './components/LoginScreen';
import OnboardingTour, { TourStep } from './components/OnboardingTour';
import { supabase } from './services/supabaseClient';
import { Folder, ReasoningState } from './types';

const INITIAL_STATE: ReasoningState = {
  assumptions: [],
  intent: [],
  constraints: [],
  anchors: [],
  conclusions: [],
  driftDetected: []
};

const TOUR_STEPS: TourStep[] = [
  {
    id: 'create-thread',
    target: 'create-thread',
    route: 'home',
    title: 'Start a thread',
    body: 'A thread is where one decision or line of thinking lives. Start here when something keeps coming back.',
    placement: 'bottom',
  },
  {
    id: 'thread-name',
    target: 'thread-name',
    route: 'home',
    title: 'Name the decision',
    body: 'Use a short, specific name. Future you should know what this was about at a glance.',
    placement: 'right',
  },
  {
    id: 'thread-intent',
    target: 'thread-intent',
    route: 'home',
    title: 'State the intent',
    body: 'Write the decision you are trying to make, or the question you want to keep honest over time.',
    placement: 'right',
  },
  {
    id: 'thread-anchors',
    target: 'thread-anchors',
    route: 'home',
    title: 'Set anchors',
    body: 'Anchors are the rules Coherence protects: constraints, values, dealbreakers, or promises you do not want to quietly rewrite.',
    placement: 'left',
  },
  {
    id: 'mount-thread',
    target: 'mount-thread',
    route: 'home',
    title: 'Mount the thread',
    body: 'When the name, intent, and anchors feel good enough, create the thread. The walkthrough continues inside it.',
    placement: 'top',
  },
  {
    id: 'commit-editor',
    target: 'commit-editor',
    route: 'folder',
    title: 'Write a commit',
    body: 'A commit is a snapshot of your reasoning right now: what changed, what you believe, what feels unresolved.',
    placement: 'right',
  },
  {
    id: 'commit-button',
    target: 'commit-button',
    route: 'folder',
    title: 'Commit the snapshot',
    body: 'Coherence saves the entry, analyzes it, and compares it against your existing state and anchors.',
    placement: 'top',
  },
  {
    id: 'coherence-state',
    target: 'coherence-state',
    route: 'folder',
    title: 'Read the state',
    body: 'This panel is the live map of your reasoning: anchors, intent, constraints, drift, and the timeline of changes.',
    placement: 'left',
  },
  {
    id: 'commit-index',
    target: 'commit-index',
    route: 'folder',
    title: 'Revisit the trail',
    body: 'The commit index lets you move through past snapshots and see how the story evolved.',
    placement: 'right',
  },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('coherence_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoadingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Load threads when user logs in
  useEffect(() => {
    if (!user) {
      setFolders([]);
      setTourActive(false);
      return;
    }
    const tourKey = `coherence_onboarding_seen_${user.id}`;
    if (!localStorage.getItem(tourKey)) {
      setTourActive(true);
      setTourStep(0);
    }
    loadFolders();
  }, [user]);

  // Browser back button → go back to threads, never log out
  useEffect(() => {
    window.history.replaceState({ view: 'home' }, '');

    const handlePopState = (e: PopStateEvent) => {
      // Always return to threads list; never touch auth
      setActiveFolderId(null);
      window.history.replaceState({ view: 'home' }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Push a history entry when entering a thread so back button works
  useEffect(() => {
    if (activeFolderId) {
      window.history.pushState({ view: 'folder', folderId: activeFolderId }, '');
    }
  }, [activeFolderId]);

  // Theme persistence
  useEffect(() => {
    localStorage.setItem('coherence_theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const loadFolders = async () => {
    setLoadingFolders(true);
    const { data, error } = await supabase
      .from('threads')
      .select('folder_data')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setFolders(data.map((row: { folder_data: Folder }) => row.folder_data));
    }
    setLoadingFolders(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const activeFolder = folders.find(f => f.id === activeFolderId);

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    const existing = folders.find(f => f.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates, lastActive: Date.now() };

    // Optimistic update
    setFolders(prev => prev.map(f => f.id === id ? updated : f));

    await supabase
      .from('threads')
      .update({ folder_data: updated, updated_at: new Date().toISOString() })
      .eq('id', id);
  };

  const deleteFolder = async (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setActiveFolderId(null);
    await supabase.from('threads').delete().eq('id', id);
  };

  const createFolder = async (name: string, intent: string, anchors: string[]) => {
    if (!user) return;
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
    if (tourActive && tourStep <= 4) {
      setTourStep(5);
    }

    await supabase.from('threads').insert({
      id: newFolder.id,
      user_id: user.id,
      folder_data: newFolder,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setActiveFolderId(null);
  };

  const finishTour = () => {
    if (user) {
      localStorage.setItem(`coherence_onboarding_seen_${user.id}`, 'true');
    }
    setTourActive(false);
  };

  const handleTourNext = () => {
    const nextStep = Math.min(tourStep + 1, TOUR_STEPS.length - 1);
    const next = TOUR_STEPS[nextStep];
    if (next.route === 'folder' && !activeFolderId && !folders[0]) {
      return;
    }
    if (next.route === 'home') {
      setActiveFolderId(null);
    } else if (next.route === 'folder' && !activeFolderId && folders[0]) {
      setActiveFolderId(folders[0].id);
    }
    setTourStep(nextStep);
  };

  const handleTourBack = () => {
    const prevStep = Math.max(tourStep - 1, 0);
    const prev = TOUR_STEPS[prevStep];
    if (prev.route === 'home') {
      setActiveFolderId(null);
    } else if (prev.route === 'folder' && !activeFolderId && folders[0]) {
      setActiveFolderId(folders[0].id);
    }
    setTourStep(prevStep);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-[10px] mono font-bold uppercase tracking-[0.3em] text-[#908e7e] dark:text-[#7a786a] animate-pulse">
          Initialising...
        </span>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (loadingFolders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-[10px] mono font-bold uppercase tracking-[0.3em] text-[#908e7e] dark:text-[#7a786a] animate-pulse">
          Loading threads...
        </span>
      </div>
    );
  }

  if (activeFolderId && activeFolder) {
    return (
      <>
        <FolderView
          folder={activeFolder}
          onBack={() => setActiveFolderId(null)}
          onUpdate={(updates) => updateFolder(activeFolder.id, updates)}
          onDeleteFolder={() => deleteFolder(activeFolder.id)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onboardingStep={tourActive ? TOUR_STEPS[tourStep]?.id : undefined}
        />
        {tourActive && (
          <OnboardingTour
            steps={TOUR_STEPS}
            currentStep={tourStep}
            onNext={handleTourNext}
            onBack={handleTourBack}
            onSkip={finishTour}
            onFinish={finishTour}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Home
        folders={folders}
        onSelectFolder={setActiveFolderId}
        onCreateFolder={createFolder}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignOut={handleSignOut}
        userEmail={user.email}
        userName={user.user_metadata?.given_name || user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
        onboardingStep={tourActive ? TOUR_STEPS[tourStep]?.id : undefined}
      />
      {tourActive && (
        <OnboardingTour
          steps={TOUR_STEPS}
          currentStep={tourStep}
          onNext={handleTourNext}
          onBack={handleTourBack}
          onSkip={finishTour}
          onFinish={finishTour}
        />
      )}
    </>
  );
};

export default App;
