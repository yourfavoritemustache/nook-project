import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

export type Collection = Database['public']['Tables']['collections']['Row'];

interface CollectionsState {
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  fetchCollections: (userId: string) => Promise<void>;
  subscribeToCollections: (userId: string) => void;
  unsubscribeFromCollections: () => void;
}

let subscription: ReturnType<typeof supabase.channel> | null = null;

export const useCollections = create<CollectionsState>((set, get) => ({
  collections: [],
  isLoading: false,
  error: null,

  fetchCollections: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      set({ collections: data as Collection[] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  subscribeToCollections: (userId: string) => {
    // Prevent multiple subscriptions
    if (subscription) return;

    subscription = supabase
      .channel('collections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collections',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Re-fetch on any change to keep it simple and handle all cascades
          get().fetchCollections(userId);
        }
      )
      .subscribe();
  },

  unsubscribeFromCollections: () => {
    if (subscription) {
      supabase.removeChannel(subscription);
      subscription = null;
    }
  },
}));

// Helper to build a nested tree
export function buildCollectionTree(collections: Collection[], parentId: string | null = null): (Collection & { children: any[] })[] {
  return collections
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({
      ...c,
      children: buildCollectionTree(collections, c.id),
    }));
}
