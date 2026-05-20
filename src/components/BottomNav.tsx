import React from 'react';
import { Inbox, Search, Folder, Tag, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'all', label: 'All', icon: Inbox },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'collections', label: 'Folders', icon: Folder },
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'settings', label: 'Profile', icon: User },
  ];

  return (
    <div 
      className="bottom-nav" 
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        padding: '6px 0',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '11px',
              flex: 1,
              transition: 'color var(--transition-fast)'
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
