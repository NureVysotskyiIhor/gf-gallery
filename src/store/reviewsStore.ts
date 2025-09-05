// src/store/reviewsStore.ts
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Types
type UserWithRole = {
  id: string;
  email: string;
  role: {
    name: string;
  } | null;
};

export interface Review {
  id: number;
  author_name: string;
  author_email?: string;
  author_avatar_url?: string;
  rating: number;
  title: string;
  content: string;
  project_name?: string;
  project_type?: string;
  is_verified: boolean;
  is_featured: boolean;
  is_visible: boolean;
  helpful_count: number;
  response_text?: string;
  response_date?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  images?: ReviewImage[];
  user_reaction?: 'helpful' | 'not_helpful' | null;
  user_id?: string;
}

export interface ReviewImage {
  id: number;
  review_id: number;
  image_url: string;
  thumbnail_url?: string;
  caption?: string;
  display_order: number;
}

export interface ReviewsStatistics {
  total_reviews: number;
  average_rating: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
  verified_count: number;
  with_images_count: number;
}

export interface ReviewFilters {
  search: string;
  author_name: string;
  author_email: string;
  rating: number | null;
  project_type: string;
  is_verified: boolean | null;
  is_featured: boolean | null;
  sortBy: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
}

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  statistics: ReviewsStatistics | null;
  filters: ReviewFilters;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  
  fetchReviews: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  setFilters: (filters: Partial<ReviewFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  addReaction: (reviewId: number, reactionType: 'helpful' | 'not_helpful') => Promise<void>;
  removeReaction: (reviewId: number) => Promise<void>;
  createReview: (review: Partial<Review>) => Promise<Review>;
  updateReview: (id: number, updates: Partial<Review>) => Promise<void>;
  deleteReview: (id: number) => Promise<void>;
  getCurrentUser: () => Promise<any>;
  canUserDeleteReview: (review: Review, user: any) => boolean;
}

const defaultFilters: ReviewFilters = {
  search: '',
  author_name: '',
  author_email: '',
  rating: null,
  project_type: '',
  is_verified: null,
  is_featured: null,
  sortBy: 'newest'
};

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  reviews: [],
  loading: false,
  error: null,
  statistics: null,
  filters: defaultFilters,
  currentPage: 1,
  itemsPerPage: 12,
  totalItems: 0,

  fetchReviews: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, currentPage, itemsPerPage } = get();
      let query = supabase
        .from('reviews')
        .select(`*, images:review_images(*)`, { count: 'exact' })
        .eq('is_visible', true);

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      if (filters.author_name) query = query.ilike('author_name', `%${filters.author_name}%`);
      if (filters.author_email) query = query.ilike('author_email', `%${filters.author_email}%`);
      if (filters.rating !== null) query = query.eq('rating', filters.rating);
      if (filters.project_type) query = query.eq('project_type', filters.project_type);
      if (filters.is_verified !== null) query = query.eq('is_verified', filters.is_verified);
      if (filters.is_featured !== null) query = query.eq('is_featured', filters.is_featured);

      switch (filters.sortBy) {
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        case 'oldest': query = query.order('created_at', { ascending: true }); break;
        case 'rating_high': query = query.order('rating', { ascending: false }); break;
        case 'rating_low': query = query.order('rating', { ascending: true }); break;
        case 'helpful': query = query.order('helpful_count', { ascending: false }); break;
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const reviewIds = data.map((r: Review) => r.id);
        const { data: reactions } = await supabase
          .from('review_reactions')
          .select('review_id, reaction_type')
          .in('review_id', reviewIds)
          .eq('user_id', user.id);
        if (reactions) {
          const map = new Map(reactions.map((r: any) => [r.review_id, r.reaction_type]));
          data.forEach((review: Review) => review.user_reaction = map.get(review.id) || null);
        }
      }

      set({ reviews: data || [], totalItems: count || 0, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch reviews', loading: false });
    }
  },

  fetchStatistics: async () => {
    try {
      const { data, error } = await supabase.rpc('get_reviews_statistics');
      if (error) throw error;
      set({ statistics: data?.[0] || null });
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  },

  setFilters: (newFilters) => {
    set(state => ({ filters: { ...state.filters, ...newFilters }, currentPage: 1 }));
    get().fetchReviews();
  },

  resetFilters: () => {
    set({ filters: defaultFilters, currentPage: 1 });
    get().fetchReviews();
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchReviews();
  },

// Improved handleReaction function for the ReviewsStore

  addReaction: async (reviewId, reactionType) => {
    try {
      console.log('Adding reaction:', { reviewId, reactionType });
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication failed');
      }

      let reactionData: any = { 
        review_id: reviewId, 
        reaction_type: reactionType 
      };

      if (user) {
        // Authenticated user
        reactionData.user_id = user.id;
        console.log('Authenticated user reaction:', reactionData);
      } else {
        // Anonymous user - try to get IP
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            reactionData.ip_address = ipData.ip;
            console.log('Anonymous user reaction with IP:', reactionData);
          } else {
            console.warn('Failed to get IP address, proceeding without it');
          }
        } catch (ipError) {
          console.warn('IP fetch failed:', ipError);
          // Continue without IP address
        }
      }

      // Try to insert first (new reaction)
      const { data: insertData, error: insertError } = await supabase
        .from('review_reactions')
        .insert([reactionData])
        .select()
        .single();

      if (insertError) {
        console.log('Insert failed, trying update:', insertError);
        
        // If insert fails due to unique constraint, try update
        if (insertError.code === '23505') { // Unique violation
          const updateData = { reaction_type: reactionType };
          let updateQuery = supabase
            .from('review_reactions')
            .update(updateData)
            .eq('review_id', reviewId);

          if (user) {
            updateQuery = updateQuery.eq('user_id', user.id);
          } else if (reactionData.ip_address) {
            updateQuery = updateQuery.eq('ip_address', reactionData.ip_address);
          } else {
            throw new Error('Cannot update reaction without user ID or IP address');
          }

          const { data: updateResult, error: updateError } = await updateQuery.select().single();
          
          if (updateError) {
            console.error('Update error:', updateError);
            throw new Error(`Failed to update reaction: ${updateError.message}`);
          }
          
          console.log('Reaction updated successfully:', updateResult);
        } else {
          console.error('Insert error (not unique violation):', insertError);
          throw new Error(`Failed to add reaction: ${insertError.message}`);
        }
      } else {
        console.log('Reaction inserted successfully:', insertData);
      }

      // Update the local state
      set(state => ({
        reviews: state.reviews.map(r =>
          r.id === reviewId
            ? {
                ...r,
                user_reaction: reactionType,
                helpful_count:
                  reactionType === 'helpful'
                    ? r.helpful_count + (r.user_reaction === 'helpful' ? 0 : 1)
                    : r.helpful_count - (r.user_reaction === 'helpful' ? 1 : 0)
              }
            : r
        )
      }));

      console.log('Local state updated successfully');

    } catch (err) {
      console.error('Error in addReaction:', err);
      // Don't throw - just log the error and show a user-friendly message
      // You might want to show a toast notification here
    }
  },

  removeReaction: async (reviewId) => {
    try {
      console.log('Removing reaction for review:', reviewId);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication failed');
      }

      let deleteQuery = supabase
        .from('review_reactions')
        .delete()
        .eq('review_id', reviewId);

      if (user) {
        deleteQuery = deleteQuery.eq('user_id', user.id);
      } else {
        // For anonymous users, try to get their IP
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            deleteQuery = deleteQuery.eq('ip_address', ipData.ip);
          } else {
            console.warn('Cannot remove anonymous reaction without IP');
            return;
          }
        } catch (ipError) {
          console.warn('Cannot get IP for anonymous reaction removal:', ipError);
          return;
        }
      }

      const { error: deleteError } = await deleteQuery;
      
      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(`Failed to remove reaction: ${deleteError.message}`);
      }

      // Update the local state
      set(state => ({
        reviews: state.reviews.map(r =>
          r.id === reviewId
            ? {
                ...r,
                user_reaction: null,
                helpful_count: r.user_reaction === 'helpful'
                  ? Math.max(0, r.helpful_count - 1)
                  : r.helpful_count
              }
            : r
        )
      }));

      console.log('Reaction removed and local state updated');

    } catch (err) {
      console.error('Error in removeReaction:', err);
      // Don't throw - just log the error
    }
  },

  createReview: async (reviewData) => {
    try {
      const { data, error } = await supabase.from('reviews').insert([reviewData]).select().single();
      if (error) throw error;
      set(state => ({ reviews: [data, ...state.reviews] }));
      get().fetchReviews();
      get().fetchStatistics();
      return data;
    } catch (err) {
      console.error('Error creating review:', err);
      throw err;
    }
  },

  updateReview: async (id, updates) => {
    try {
      const { data, error } = await supabase.from('reviews').update(updates).eq('id', id).select().single();
      if (error) throw error;
      set(state => ({ reviews: state.reviews.map(r => (r.id === id ? data : r)) }));
    } catch (err) {
      console.error('Error updating review:', err);
      throw err;
    }
  },

  deleteReview: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Необходимо войти в систему");

      // 1. Проверяем пользователя и его роль
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, email, role:roles(name)")
        .eq("id", user.id)
        .single<UserWithRole>();

      if (userError || !userData) {
        throw new Error("Не удалось получить пользователя или его роль");
      }

      const isAdmin = userData.role?.name === "admin";

      // 2. Получаем сам отзыв (узнаем, кто его создал)
      const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .select("id, user_id, author_email")
        .eq("id", id)
        .single<{ id: number; user_id: string; author_email?: string }>();

      if (reviewError || !review) {
        throw new Error("Отзыв не найден");
      }

      const isOwner =
        review.user_id === userData.id || review.author_email === userData.email;

      // 3. Проверяем права
      if (!isAdmin && !isOwner) {
        throw new Error("У вас нет прав для удаления этого отзыва");
      }

      // 4. Удаляем
      const { error: deleteError } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error("Ошибка при удалении отзыва: " + deleteError.message);
      }

      // 5. Обновляем состояние
      set((state) => ({
        reviews: state.reviews.filter((r) => r.id !== id),
      }));
      get().fetchStatistics();
    } catch (err) {
      console.error("Error deleting review:", err);
      throw err;
    }
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  canUserDeleteReview: (review, user) => {
    if (!user) return false;
    return review.user_id === user.id || review.author_email === user.email;
  }
}));
