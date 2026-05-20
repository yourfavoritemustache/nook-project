import React, { useState, useEffect } from 'react';
import { X, Folder, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCollections, Collection } from '../store/useCollections';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCollection?: Collection | null;
  parentId?: string | null;
}

const COLORS = [
  '#64748B', '#EF4444', '#F97316', '#F59E0B', 
  '#10B981', '#0EA5E9', '#3B82F6', '#6366F1', 
  '#8B5CF6', '#D946EF', '#F43F5E'
];

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  editCollection,
  parentId = null
}) => {
  const { collections, fetchCollections } = useCollections();
  
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parentId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editCollection) {
        setName(editCollection.name);
        setColor(editCollection.color || COLORS[0]);
        setSelectedParentId(editCollection.parent_id);
      } else {
        setName('');
        setColor(COLORS[0]);
        setSelectedParentId(parentId);
      }
      setError(null);
    }
  }, [isOpen, editCollection, parentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Placeholder user ID
    const userId = '00000000-0000-0000-0000-000000000000';

    try {
      if (editCollection) {
        const { error } = await supabase
          .from('collections')
          .update({
            name: name.trim(),
            color,
            parent_id: selectedParentId,
            updated_at: new Date().toISOString()
          })
          .eq('id', editCollection.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('collections')
          .insert({
            user_id: userId,
            name: name.trim(),
            color,
            parent_id: selectedParentId,
            sort_order: 0
          });
        if (error) throw error;
      }

      await fetchCollections(userId);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const availableParents = collections.filter(c => c.id !== editCollection?.id);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card animate-slide-up" style={{
        width: '100%',
        maxWidth: '480px',
        margin: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>
            {editCollection ? 'Edit Collection' : 'New Collection'}
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div style={{
              backgroundColor: 'var(--danger)',
              color: 'white',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Inspiration"
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Parent Collection (Optional)</label>
            <select 
              value={selectedParentId || ''}
              onChange={(e) => setSelectedParentId(e.target.value || null)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                fontSize: '15px'
              }}
            >
              <option value="">None (Top Level)</option>
              {availableParents.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Color</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: c,
                    border: color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: color === c ? '0 0 0 2px var(--bg-surface) inset' : 'none',
                    transition: 'transform 0.1s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn"
              style={{ border: '1px solid var(--border-color)' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
