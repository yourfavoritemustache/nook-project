import React, { useState, useEffect } from 'react';
import { Menu, Grid, List, Plus, Sun, Moon, Loader2 } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Auth } from './components/Auth';
import { useAuth } from './store/useAuth';

import { CollectionModal } from './components/CollectionModal';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import type { Collection } from './store/useCollections';

type ViewMode = 'grid' | 'list' | 'masonry' | 'headlines';

function App() {
  const { session, isLoading, initialize } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCollection, setEditCollection] = useState<Collection | null>(null);
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);

  // Parse collection ID from currentTab if it's numeric
  const activeCollectionId = !isNaN(Number(currentTab)) && currentTab.trim() !== '' ? Number(currentTab) : null;

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle application theme toggling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark-theme');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('dark-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'all': return 'All Bookmarks';
      case 'unsorted': return 'Unsorted';
      case 'trash': return 'Trash';
      case 'collections': return 'Collections';
      case 'tags': return 'Tags';
      case 'highlights': return 'Highlights';
      case 'settings': return 'Settings & Profile';
      default: return 'Nook';
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'create-collection') {
      setEditCollection(null);
      setIsModalOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={handleTabChange} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onEditCollection={(collection) => {
          setEditCollection(collection);
          setIsModalOpen(true);
        }}
      />

      {/* Main Content Pane */}
      <main className="main-content">
        {/* Header Bar */}
        <header 
          style={{
            height: 'var(--header-height)',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="btn-icon" 
              onClick={() => setSidebarOpen(true)}
              style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
            >
              <Menu size={22} />
            </button>
            <h1 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {getHeaderTitle()}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* View Mode Toggle (Only show on bookmarks tab) */}
            {['all', 'unsorted', 'trash'].includes(currentTab) && (
              <div 
                style={{ 
                  display: 'flex', 
                  backgroundColor: 'var(--bg-app)', 
                  padding: '2px', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <button 
                  onClick={() => setViewMode('list')}
                  style={{
                    border: 'none',
                    background: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                    color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  style={{
                    border: 'none',
                    background: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Grid size={16} />
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <button className="btn-icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        {/* Dynamic Inner Tab View Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }} className="animate-fade-in">
          {currentTab === 'all' && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '80px' }}>
              <Inbox size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3>Your library is empty</h3>
              <p style={{ fontSize: '14px', marginTop: '6px' }}>Click the button below to save your first bookmark.</p>
            </div>
          )}

          {currentTab === 'unsorted' && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '80px' }}>
              <Inbox size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3>No unsorted bookmarks</h3>
            </div>
          )}

          {currentTab === 'trash' && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '80px' }}>
              <Inbox size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3>Trash is empty</h3>
            </div>
          )}

          {currentTab === 'collections' && (
            <div>
              <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>My Collections</h2>
              <div className="card" style={{ padding: '20px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Nested folder trees will be configured here in Feature 3.</p>
              </div>
            </div>
          )}

          {currentTab === 'tags' && (
            <div>
              <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>Tags</h2>
              <div className="card" style={{ padding: '20px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Tag lists will be displayed here in Feature 7.</p>
              </div>
            </div>
          )}

          {currentTab === 'highlights' && (
            <div>
              <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>Highlights</h2>
              <div className="card" style={{ padding: '20px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Your annotations and text snippets will appear here in Feature 6.</p>
              </div>
            </div>
          )}

          {currentTab === 'settings' && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '22px', marginBottom: '24px' }}>Settings</h2>
              
              <section className="card" style={{ padding: '20px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Dropbox Integration</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                  Link your Dropbox account to store backup page HTMLs and PDFs on your own 8TB storage.
                </p>
                <button className="btn btn-primary" style={{ width: '100%' }}>
                  Connect Dropbox Account
                </button>
              </section>

              <section className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>AI Assistant (Stella)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                  Provide a custom Gemini API key to customize your personal assistant.
                </p>
                <input 
                  type="password" 
                  placeholder="Enter Gemini API Key..." 
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-app)',
                    marginBottom: '12px'
                  }}
                />
                <button className="btn" style={{ width: '100%', border: '1px solid var(--border-color)' }}>
                  Save API Key
                </button>
              </section>
            </div>
          )}
        </div>

        {/* Floating Action Button (FAB) to Add Bookmark */}
        {['all', 'unsorted', 'collections'].includes(currentTab) || activeCollectionId !== null ? (
          <button className="fab" onClick={() => setIsAddBookmarkOpen(true)}>
            <Plus size={24} />
          </button>
        ) : null}

        {/* Mobile Bottom Navigation */}
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />

        <CollectionModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setEditCollection(null);
          }} 
          editCollection={editCollection} 
        />

        <AddBookmarkModal 
          isOpen={isAddBookmarkOpen}
          onClose={() => setIsAddBookmarkOpen(false)}
          currentCollectionId={activeCollectionId}
        />
      </main>
    </div>
  );
}

// Inline fallback since Lucide icon list may not import Inbox directly
const Inbox = ({ size, style }: { size?: number, style?: React.CSSProperties }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export default App;
