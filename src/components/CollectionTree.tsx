import React, { useState } from 'react';
import { Folder, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import type { Collection } from '../store/useCollections';

interface CollectionTreeProps {
  collections: (Collection & { children: any[] })[];
  currentTab: string;
  onSelect: (collectionId: string) => void;
  onEdit?: (collection: Collection) => void;
  level?: number;
}

export const CollectionTree: React.FC<CollectionTreeProps> = ({
  collections,
  currentTab,
  onSelect,
  onEdit,
  level = 0,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (collections.length === 0) {
    if (level === 0) return null;
    return null; // Empty nested array, render nothing
  }

  return (
    <ul style={{ listStyle: 'none', paddingLeft: level === 0 ? '0' : '16px', marginTop: '4px' }}>
      {collections.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expanded[node.id];
        const isActive = currentTab === node.id;

        return (
          <li key={node.id} style={{ marginBottom: '2px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                userSelect: 'none',
              }}
              onClick={() => onSelect(node.id)}
            >
              {/* Expand Toggle */}
              <div 
                style={{ width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={(e) => hasChildren && toggleExpand(e, node.id)}
              >
                {hasChildren && (
                  isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                )}
              </div>

              {/* Icon */}
              <div style={{ margin: '0 8px', color: node.color || 'inherit' }}>
                <Folder size={16} fill={isActive ? 'currentColor' : 'none'} />
              </div>

              {/* Title */}
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' }}>
                {node.name}
              </span>

              {/* Actions (Edit) */}
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(node);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                  className="collection-action-btn"
                >
                  <MoreHorizontal size={14} />
                </button>
              )}
            </div>

            {/* Recursive Children */}
            {hasChildren && isExpanded && (
              <CollectionTree
                collections={node.children}
                currentTab={currentTab}
                onSelect={onSelect}
                onEdit={onEdit}
                level={level + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};
