import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Link, Loader2 } from 'lucide-react';
import { useBookmarks } from '../store/useBookmarks';
import { useAuth } from '../store/useAuth';
import { useCollections } from '../store/useCollections';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCollectionId: number | null;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  currentCollectionId
}) => {
  const [url, setUrl] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(currentCollectionId);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addBookmark } = useBookmarks();
  const { user } = useAuth();
  const { collections } = useCollections();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setError(null);
      setSelectedCollectionId(currentCollectionId);
    }
  }, [isOpen, currentCollectionId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!user) {
      setError('You must be logged in');
      return;
    }

    let parsedUrl = url.trim();
    if (!/^https?:\/\//i.test(parsedUrl)) {
      parsedUrl = 'https://' + parsedUrl;
    }

    setLocalLoading(true);
    setError(null);

    try {
      await addBookmark(parsedUrl, selectedCollectionId, user.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save bookmark');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="card animate-slide-up" style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'var(--bg-app)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Add Bookmark</h2>
          <button className="btn-icon" onClick={onClose} disabled={localLoading}>
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
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>URL</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}>
                <Link size={18} />
              </div>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                autoFocus
                disabled={localLoading}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Save to Collection</label>
            <select 
              value={selectedCollectionId ?? ''}
              onChange={(e) => setSelectedCollectionId(e.target.value ? parseInt(e.target.value, 10) : null)}
              disabled={localLoading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                fontSize: '15px'
              }}
            >
              <option value="">Unsorted (Inbox)</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              type="button" 
              className="btn" 
              onClick={onClose}
              disabled={localLoading}
              style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={localLoading || !url.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {localLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save Bookmark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
