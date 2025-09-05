// src/store/paintingListStore.ts
import { create } from 'zustand'
import { createClient } from '@supabase/supabase-js'
import type { ExtendedPainting } from '@/lib/types/paintingTypes'
import { useUserStore } from "@/store/userStore";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

export type PaintingStatusFilter = 'all' | 'for_sale' | 'not_for_sale' | 'sold';
export type PaintingActiveFilter = 'all' | 'active' | 'inactive';

interface PaintingListState {
  paintingsByOwner: ExtendedPainting[]
  favoritePaintings: ExtendedPainting[]
  publicPaintings: ExtendedPainting[]
  
  // Unified properties for MainPaintingsPage
  paintings: ExtendedPainting[]
  loading: boolean
  error: string | null
  
  loadingOwner: boolean
  loadingFavorites: boolean
  loadingPublic: boolean

  // Filter states
  ownerStatusFilter: PaintingStatusFilter
  ownerActiveFilter: PaintingActiveFilter
  favoriteStatusFilter: PaintingStatusFilter

  // Filtered arrays
  filteredPaintingsByOwner: ExtendedPainting[]
  filteredFavoritePaintings: ExtendedPainting[]

  fetchPaintingsByOwner: (userId: string) => Promise<void>
  fetchFavoritePaintings: (userId: string) => Promise<void>
  fetchPublicPaintings: () => Promise<void>
  
  // Unified method for MainPaintingsPage
  fetchPaintings: () => Promise<void>
  
  toggleFavorite: (
  userId: string,
  paintingId: number
) => Promise<
  | { success: true; isNowFavorite: boolean; action: "added" | "removed" }
  | { success: false; error: string }
>
  
  // Method to check if painting is in favorites
  isPaintingFavorite: (paintingId: number) => boolean

  // Filter methods
  setOwnerStatusFilter: (filter: PaintingStatusFilter) => void
  setOwnerActiveFilter: (filter: PaintingActiveFilter) => void
  setFavoriteStatusFilter: (filter: PaintingStatusFilter) => void

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

// Helper function to apply filters
const applyStatusFilter = (paintings: ExtendedPainting[], statusFilter: PaintingStatusFilter): ExtendedPainting[] => {
  if (statusFilter === 'all') return paintings;
  return paintings.filter(painting => painting.status === statusFilter);
};

const applyActiveFilter = (paintings: ExtendedPainting[], activeFilter: PaintingActiveFilter): ExtendedPainting[] => {
  if (activeFilter === 'all') return paintings;
  return paintings.filter(painting => 
    activeFilter === 'active' ? painting.is_active : !painting.is_active
  );
};

export const usePaintingListStore = create<PaintingListState>((set, get) => ({
  paintingsByOwner: [],
  favoritePaintings: [],
  publicPaintings: [],
  paintings: [], // Unified paintings array
  loading: false, // Unified loading state
  error: null, // Unified error state
  loadingOwner: false,
  loadingFavorites: false,
  loadingPublic: false,

  // Filter states
  ownerStatusFilter: 'all',
  ownerActiveFilter: 'all',
  favoriteStatusFilter: 'all',

  // Filtered arrays
  filteredPaintingsByOwner: [],
  filteredFavoritePaintings: [],

  fetchPaintingsByOwner: async (userId) => {
    set({ loadingOwner: true })
    try {
      const { data, error } = await supabase
        .from('paintings')
        .select(`
          *,
          users!paintings_created_by_fkey (
            username
          )
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const paintings = data as ExtendedPainting[]
      const state = get()
      
      // Apply current filters
      let filtered = applyStatusFilter(paintings, state.ownerStatusFilter)
      filtered = applyActiveFilter(filtered, state.ownerActiveFilter)
      
      set({ 
        paintingsByOwner: paintings, 
        filteredPaintingsByOwner: filtered,
        loadingOwner: false 
      })
    } catch (error) {
      console.error(error)
      set({ 
        paintingsByOwner: [], 
        filteredPaintingsByOwner: [],
        loadingOwner: false 
      })
    }
  },

  fetchFavoritePaintings: async (userId) => {
    set({ loadingFavorites: true })
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          painting:paintings(
            *,
            users!paintings_created_by_fkey (
              username
            )
          )
        `)
        .eq('user_id', userId)
      
      if (error) throw error
      
      const paintings = (data as any[]).map((r) => r.painting) as ExtendedPainting[]
      const state = get()
      
      // Apply current filter
      const filtered = applyStatusFilter(paintings, state.favoriteStatusFilter)
      
      set({
        favoritePaintings: paintings,
        filteredFavoritePaintings: filtered,
        loadingFavorites: false,
      })
    } catch (error) {
      console.error(error)
      set({ 
        favoritePaintings: [], 
        filteredFavoritePaintings: [],
        loadingFavorites: false 
      })
    }
  },

  fetchPublicPaintings: async () => {
    set({ loadingPublic: true })
    try {
      const { data, error } = await supabase
        .from('paintings')
        .select(`
          *,
          users!paintings_created_by_fkey (
            username
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      set({ publicPaintings: data as any, loadingPublic: false })
    } catch (error) {
      console.error(error)
      set({ publicPaintings: [], loadingPublic: false })
    }
  },

  // Unified method for MainPaintingsPage - fetches public paintings
    fetchPaintings: async () => {
      set({ loading: true, error: null })
      try {
        const { data, error } = await supabase
          .from('paintings')
          .select(`
            *,
            users!paintings_created_by_fkey (
              username
            )
          `)
          .eq('is_public', true)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        set({ 
          paintings: data as any, 
          publicPaintings: data as any, // Keep both in sync
          loading: false,
          error: null
        })
      } catch (error: any) {
        console.error('Error fetching paintings:', error)
        set({ 
          paintings: [], 
          loading: false, 
          error: error.message || 'Произошла ошибка при загрузке картин'
        })
      }
    },

  // Исправленный метод toggleFavorite в paintingListStore.ts

  toggleFavorite: async (userId, paintingId) => {
    try {
      // Сначала проверяем текущее состояние
      const { data: existing, error: checkError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .eq('painting_id', paintingId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      let isNowFavorite: boolean;

      if (existing) {
        // Удаляем из избранного
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('painting_id', paintingId)
        
        if (deleteError) throw deleteError
        isNowFavorite = false
      } else {
        // Добавляем в избранное
        const { error: insertError } = await supabase
          .from('favorites')
          .insert({ user_id: userId, painting_id: paintingId })
        
        if (insertError) throw insertError
        isNowFavorite = true
      }

      // Обновляем локальное состояние сразу, не дожидаясь перезагрузки
      const state = get()
      
      if (isNowFavorite) {
        // Добавляем картину в избранное локально (если её там ещё нет)
        const paintingExists = state.favoritePaintings.some(p => p.id === paintingId)
        if (!paintingExists) {
          // Ищем картину в других массивах или загружаем из БД
          const painting = state.paintingsByOwner.find(p => p.id === paintingId) ||
                          state.publicPaintings.find(p => p.id === paintingId) ||
                          state.paintings.find(p => p.id === paintingId)
          
          if (painting) {
            set(state => ({
              favoritePaintings: [...state.favoritePaintings, painting],
              filteredFavoritePaintings: applyStatusFilter([...state.favoritePaintings, painting], state.favoriteStatusFilter)
            }))
          }
        }
      } else {
        // Удаляем картину из избранного локально
        set(state => ({
          favoritePaintings: state.favoritePaintings.filter(p => p.id !== paintingId),
          filteredFavoritePaintings: state.filteredFavoritePaintings.filter(p => p.id !== paintingId)
        }))
      }

      // Возвращаем результат для компонента
      return {
        success: true,
        isNowFavorite,
        action: isNowFavorite ? 'added' : 'removed'
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error)
      // Возвращаем информацию об ошибке
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }
    }
  },

  // Method to check if painting is in favorites
  isPaintingFavorite: (paintingId: number) => {
    const state = get()
    return state.favoritePaintings.some(painting => painting.id === paintingId)
  },

  // Filter methods
  setOwnerStatusFilter: (filter: PaintingStatusFilter) => {
    const state = get()
    let filtered = applyStatusFilter(state.paintingsByOwner, filter)
    filtered = applyActiveFilter(filtered, state.ownerActiveFilter)
    
    set({ 
      ownerStatusFilter: filter,
      filteredPaintingsByOwner: filtered
    })
  },

  setOwnerActiveFilter: (filter: PaintingActiveFilter) => {
    const state = get()
    let filtered = applyStatusFilter(state.paintingsByOwner, state.ownerStatusFilter)
    filtered = applyActiveFilter(filtered, filter)
    
    set({ 
      ownerActiveFilter: filter,
      filteredPaintingsByOwner: filtered
    })
  },

  setFavoriteStatusFilter: (filter: PaintingStatusFilter) => {
    const state = get()
    const filtered = applyStatusFilter(state.favoritePaintings, filter)
    
    set({ 
      favoriteStatusFilter: filter,
      filteredFavoritePaintings: filtered
    })
  },

  updatePainting: async (paintingId, updates) => {
    try {
      const { error } = await supabase
        .from('paintings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', paintingId)

      if (error) throw error

      // Refresh user's paintings
      const user = useUserStore.getState().user
      if (user?.id) {
        await get().fetchPaintingsByOwner(user.id)
        
        // If the painting is public, also refresh public paintings and main paintings
        if (updates.is_public !== false) {
          await get().fetchPaintings()
        }
      }
    } catch (error) {
      console.error('Ошибка обновления картины', error)
      throw error
    }
  },

  deletePainting: async (paintingId) => {
    try {
      const { error } = await supabase
        .from('paintings')
        .delete()
        .eq('id', paintingId)

      if (error) throw error

      // Refresh user's paintings
      const user = useUserStore.getState().user
      if (user?.id) {
        await get().fetchPaintingsByOwner(user.id)
        // Also refresh public paintings to remove deleted painting
        await get().fetchPaintings()
      }
    } catch (error) {
      console.error('Ошибка удаления картины', error)
      throw error
    }
  },

  addPainting: async (newPainting) => {
    const { data: { user } } = await supabase.auth.getUser();
console.log("DEBUG USER:", user);
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Не авторизован")

      const { error } = await supabase
        .from("paintings")
        .insert({
          title: newPainting.title,
          description: newPainting.description,
          price: newPainting.price,
          image_url: newPainting.image_url,
          status: newPainting.status,
          is_public: true,
          is_active: true,
          created_by: user.id, // 👈 гарантированно совпадает с auth.uid()
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      await get().fetchPaintingsByOwner(user.id)
      await get().fetchPaintings()
    } catch (error) {
      console.error("Ошибка создания картины", error)
      throw error
    }
  },
}))

// Helper function to get status display info
export const getStatusInfo = (status: string) => {
  switch (status) {
    case 'for_sale':
      return { 
        label: 'Продается', 
        color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        icon: '💰'
      };
    case 'not_for_sale':
      return { 
        label: 'Не продается', 
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        icon: '🎨'
      };
    case 'sold':
      return { 
        label: 'Продано', 
        color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/30',
        icon: '✅'
      };
    default:
      return { 
        label: 'Неизвестно', 
        color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/30',
        icon: '❓'
      };
  }
};