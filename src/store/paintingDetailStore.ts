// src/store/paintingDetailStore.ts
import { create } from 'zustand'
import { createClient } from '@supabase/supabase-js'
import type { ExtendedPainting } from '@/lib/types/paintingTypes'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

interface PaintingDetailState {
  painting: ExtendedPainting | null
  loading: boolean
  isFavorite: boolean

  fetchPainting: (id: number) => Promise<void>
  fetchFavorite: (userId: string, paintingId: number) => Promise<void>
  toggleFavorite: (userId: string, paintingId: number) => Promise<void>
}

export const usePaintingDetailStore = create<PaintingDetailState>((set, get) => ({
  painting: null,
  loading: false,
  isFavorite: false,

  fetchPainting: async (id) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('paintings')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      console.error(error)
      set({ painting: null, loading: false })
    } else {
      set({ painting: data as ExtendedPainting, loading: false })
    }
  },

  // paintingDetailStore.ts
  fetchFavorite: async (userId, paintingId) => {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { head: true, count: 'exact' })
      .eq('user_id', userId)
      .eq('painting_id', paintingId);

    if (!error) {
      set({ isFavorite: (count ?? 0) > 0 });
    }
  },

  toggleFavorite: async (userId, paintingId) => {
    const { isFavorite, painting } = get()
    if (!painting) return
    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId, painting_id: paintingId })
      set({ isFavorite: false })
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, painting_id: paintingId })
      set({ isFavorite: true })
    }
  },
}))
