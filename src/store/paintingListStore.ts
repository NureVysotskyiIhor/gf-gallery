// src/store/paintingListStore.ts
import { create } from 'zustand'
import { createClient } from '@supabase/supabase-js'
import type { ExtendedPainting } from '@/lib/types/paintingTypes'
import { useUserStore } from "@/store/userStore";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

interface PaintingListState {
  paintingsByOwner: ExtendedPainting[]
  favoritePaintings: ExtendedPainting[]
  publicPaintings: ExtendedPainting[]
  loadingOwner: boolean
  loadingFavorites: boolean
  loadingPublic: boolean

  fetchPaintingsByOwner: (userId: string) => Promise<void>
  fetchFavoritePaintings: (userId: string) => Promise<void>
  fetchPublicPaintings: () => Promise<void>
  toggleFavorite: (userId: string, paintingId: number) => Promise<void>

  /** Новый метод — обновляет запись картины */
  updatePainting: (
    paintingId: number,
    updates: Partial<Pick<ExtendedPainting, 'title' | 'description' | 'price' | "image_url" | "status" | "is_active" | "is_public">>
  ) => Promise<void>
  /** Новый метод — удаляет картину из БД */
  deletePainting: (paintingId: number) => Promise<void>
  addPainting: (
    painting: Pick<ExtendedPainting, "title" | "description" | "price" | "created_by" | "image_url" | "status"| "is_active" | "is_public">
  ) => Promise<void>
}

export const usePaintingListStore = create<PaintingListState>((set, get) => ({
  paintingsByOwner: [],
  favoritePaintings: [],
  publicPaintings: [],
  loadingOwner: false,
  loadingFavorites: false,
  loadingPublic: false,

  fetchPaintingsByOwner: async (userId) => {
    set({ loadingOwner: true })
    const { data, error } = await supabase
      .from('paintings')
      .select('*')
      .eq('created_by', userId)
    if (error) {
      console.error(error)
      set({ paintingsByOwner: [], loadingOwner: false })
    } else {
      set({ paintingsByOwner: data as ExtendedPainting[], loadingOwner: false })
    }
  },

  fetchFavoritePaintings: async (userId) => {
    set({ loadingFavorites: true })
    const { data, error } = await supabase
      .from('favorites')
      .select('painting:paintings(*)')
      .eq('user_id', userId)
    if (error) {
      console.error(error)
      set({ favoritePaintings: [], loadingFavorites: false })
    } else {
      set({
        favoritePaintings: (data as any[]).map((r) => r.painting),
        loadingFavorites: false,
      })
    }
  },

  fetchPublicPaintings: async () => {
    set({ loadingPublic: true })
    const { data, error } = await supabase
      .from('paintings')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
    if (error) {
      console.error(error)
      set({ publicPaintings: [], loadingPublic: false })
    } else {
      set({ publicPaintings: data as ExtendedPainting[], loadingPublic: false })
    }
  },

  toggleFavorite: async (userId, paintingId) => {
    const { data: existing, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('painting_id', paintingId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error(error)
      return
    }

    if (existing) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('painting_id', paintingId)
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, painting_id: paintingId })
    }

    // не обновляем publicPaintings, т.к. это не влияет
    await get().fetchFavoritePaintings(userId)
  },

  updatePainting: async (paintingId, updates) => {
    // 1) Обновляем запись
    const { error } = await supabase
      .from('paintings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', paintingId)

    if (error) {
      console.error('Ошибка обновления картины', error)
      throw error
    }

    // 2) Перезагружаем картины пользователя
    const user = useUserStore.getState().user
    if (!user?.id) {
      console.warn('Неизвестный userId, пропускаем fetchPaintingsByOwner')
      return
    }
    await get().fetchPaintingsByOwner(user.id)
  },

  deletePainting: async (paintingId) => {
    // 1) Удаляем запись
    const { error } = await supabase
      .from('paintings')
      .delete()
      .eq('id', paintingId)

    if (error) {
      console.error('Ошибка удаления картины', error)
      throw error
    }

    // 2) Перезагружаем картины пользователя
    const user = useUserStore.getState().user
    if (!user?.id) {
      console.warn('Неизвестный userId, пропускаем fetchPaintingsByOwner')
      return
    }
    await get().fetchPaintingsByOwner(user.id)
  },
  addPainting: async (newPainting) => {
    const { error } = await supabase
      .from("paintings")
      .insert({
        ...newPainting,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error("Ошибка создания картины", error)
      throw error
    }

    const user = useUserStore.getState().user
    if (user?.id) {
      await get().fetchPaintingsByOwner(user.id)
    }
  },
}))
