import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];

interface BookmarksState {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  fetchBookmarks: (collectionId?: number | null) => Promise<void>;
  addBookmark: (url: string, collectionId: number | null, userId: string) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
}

export const useBookmarks = create<BookmarksState>((set) => ({
  bookmarks: [],
  isLoading: false,
  error: null,

  fetchBookmarks: async (collectionId?: number | null) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (collectionId !== undefined) {
        if (collectionId === null) {
          query = query.is('collection_id', null);
        } else {
          query = query.eq('collection_id', collectionId);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      set({ bookmarks: data as Bookmark[] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addBookmark: async (url: string, collectionId: number | null, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Fetch metadata using the edge function
      const { data: metaData, error: funcError } = await supabase.functions.invoke('extract-metadata', {
        body: { url },
      });

      if (funcError) throw new Error(`Failed to extract metadata: ${funcError.message}`);

      // 2. Insert into database
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          url,
          title: metaData?.title || url,
          excerpt: metaData?.description || null,
          cover_url: metaData?.thumbnail || null,
          domain: metaData?.domain || new URL(url).hostname,
          type: 'link',
          collection_id: collectionId,
          tags: []
        })
        .select()
        .single();

      if (error) throw error;

      // 3. Update local state
      set((state) => ({ bookmarks: [data, ...state.bookmarks] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err; // Re-throw so UI can handle
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBookmark: async (id: string) => {
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ bookmarks: state.bookmarks.filter(b => b.id !== id) }));
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
