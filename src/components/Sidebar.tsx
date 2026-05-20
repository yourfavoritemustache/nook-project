import React, { useEffect } from 'react';
import { 
  Inbox, 
  Tag, 
  Highlighter, 
  Settings, 
  Trash2, 
  Bookmark,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useCollections, buildCollectionTree } from '../store/useCollections';
import { CollectionTree } from './CollectionTree';

import type { Collection } from '../store/useCollections';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onEditCollection: (collection: Collection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onTabChange, 
  isOpen, 
  onClose,
  onEditCollection
}) => {
  const [collectionsExpanded, setCollectionsExpanded] = React.useState(true);

  // Hook up to Zustand store
  const { collections, fetchCollections, subscribeToCollections, unsubscribeFromCollections } = useCollections();

  // Placeholder user ID until auth is fully implemented in the shell
  const userId = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchCollections(userId);
    subscribeToCollections(userId);
    return () => unsubscribeFromCollections();
  }, []);

  const tree = buildCollectionTree(collections, null);

  const navItems = [
    { id: 'all', label: 'All Bookmarks', icon: Inbox },
    { id: 'unsorted', label: 'Unsorted', icon: Bookmark },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Sidebar Header / Logo */}
      <div style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '18px',
          fontFamily: 'var(--font-display)'
        }}>
          N
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '18px',
          color: 'var(--text-primary)'
        }}>Nook</span>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <li key={item.id} style={{ marginBottom: '4px' }}>
                <button
                  onClick={() => handleTabClick(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  className="nav-link"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />

          {/* Collections Section */}
          <li style={{ marginBottom: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 12px',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <button 
                onClick={() => setCollectionsExpanded(!collectionsExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  color: 'inherit',
                  fontWeight: 'inherit',
                  textTransform: 'inherit'
                }}
              >
                {collectionsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Collections
              </button>
              <button 
                onClick={() => handleTabClick('create-collection')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <Plus size={14} />
              </button>
            </div>

            {collectionsExpanded && (
              <div style={{ marginTop: '6px' }}>
                {tree.length > 0 ? (
                  <CollectionTree 
                    collections={tree} 
                    currentTab={currentTab} 
                    onSelect={handleTabClick}
                    onEdit={onEditCollection}
                  />
                ) : (
                  <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    No collections yet
                  </div>
                )}
              </div>
            )}
          </li>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />

          {/* Tags */}
          <li style={{ marginBottom: '4px' }}>
            <button
              onClick={() => handleTabClick('tags')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: currentTab === 'tags' ? 'var(--bg-hover)' : 'transparent',
                color: currentTab === 'tags' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: currentTab === 'tags' ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              <Tag size={18} />
              <span>Tags</span>
            </button>
          </li>

          {/* Highlights */}
          <li style={{ marginBottom: '4px' }}>
            <button
              onClick={() => handleTabClick('highlights')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: currentTab === 'highlights' ? 'var(--bg-hover)' : 'transparent',
                color: currentTab === 'highlights' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: currentTab === 'highlights' ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              <Highlighter size={18} />
              <span>Highlights</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Sidebar Footer / Profile & Settings */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontWeight: 600
          }}>
            U
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>User Profile</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Free Plan</span>
          </div>
        </div>
        <button 
          onClick={() => handleTabClick('settings')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <Settings size={18} />
        </button>
      </div>
    </aside>
  );
};
