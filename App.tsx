import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Home from './components/Home';
import FolderView from './components/FolderView';
import LoginScreen from './components/LoginScreen';
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
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
      return;
    }
    loadFolders();
  }, [user]);

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
      onSignOut={handleSignOut}
      userEmail={user.email}
    />
  );
};

export default App;
