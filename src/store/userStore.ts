// src/store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';
import type { ExtendedUser } from '@/lib/types/userTypes';
import type { NavigateFn } from '@tanstack/react-router';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface UserState {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  isInitialized: boolean; // Новое поле для отслеживания инициализации
  setUser: (user: ExtendedUser | null) => void;
  fetchUserById: (id: string) => Promise<ExtendedUser | null>;
  fetchUser: (navigate: NavigateFn) => Promise<void>;
  initializeAuth: (navigate: NavigateFn) => Promise<void>; // Новый метод
  updateUserProfile: (updates: {
    username?: string;
    avatar_url?: string;
    bio?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  searchUsers: (query: string, excludeCurrentUser?: boolean) => Promise<any[]>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      isInitialized: false,

      setUser: (user) => {
        console.log('Setting user:', user);
        set({ 
          user, 
          isAuthenticated: !!user,
          isInitialized: true
        });
      },

      // Новый метод для инициализации при запуске приложения
      initializeAuth: async (navigate) => {
        const state = get();
        if (state.isInitialized) return;

        set({ loading: true });
        console.log('Initializing auth...');

        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            set({ user: null, isAuthenticated: false, loading: false, isInitialized: true });
            return;
          }

          if (!session?.user) {
            console.log('No active session found');
            set({ user: null, isAuthenticated: false, loading: false, isInitialized: true });
            return;
          }

          console.log('Active session found, fetching profile...');
          
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError || !profile) {
            console.log('Profile not found, redirecting to complete profile');
            set({ loading: false, isInitialized: true });
            navigate({ to: '/route-complete-profile' });
            return;
          }

          const fullUser: ExtendedUser = {
            id: session.user.id,
            email: session.user.email ?? profile.email,
            username: profile.username,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            role_id: profile.role_id,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          };

          console.log('User profile loaded:', fullUser);
          set({ user: fullUser, isAuthenticated: true, loading: false, isInitialized: true });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({ user: null, isAuthenticated: false, loading: false, isInitialized: true });
        }
      },

      fetchUserById: async (userId: string) => {
        set({ loading: true });

        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (error || !profile) {
            set({ loading: false });
            return null;
          }

          const fullUser: ExtendedUser = {
            id: profile.id,
            email: profile.email,
            username: profile.username,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            role_id: profile.role_id,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          };

          set({ loading: false });
          return fullUser;
        } catch (error) {
          console.error('Failed to fetch user by id:', error);
          set({ loading: false });
          return null;
        }
      },

      fetchUser: async (navigate) => {
        set({ loading: true });
        
        try {
          const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

          if (authError || !authUser) {
            set({ user: null, isAuthenticated: false, loading: false });
            return;
          }

          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profileError || !profile) {
            set({ loading: false });
            navigate({ to: '/route-complete-profile' });
            return;
          }

          const fullUser: ExtendedUser = {
            id: authUser.id,
            email: authUser.email ?? profile.email,
            username: profile.username,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            role_id: profile.role_id,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          };

          set({ user: fullUser, isAuthenticated: true, loading: false });
        } catch (error) {
          console.error('Failed to fetch user:', error);
          set({ user: null, isAuthenticated: false, loading: false });
        }
      },

      updateUserProfile: async (updates) => {
        const { user } = get();
        if (!user) return;

        const { error } = await supabase
          .from('users')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;

        const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
        set({ user: updatedUser });
      },

      signOut: async () => {
        console.log('Signing out...');
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },

      searchUsers: async (query: string, excludeCurrentUser = true) => {
        if (!query.trim() || query.length < 2) {
          return [];
        }

        try {
          const { user } = get();
          let queryBuilder = supabase
            .from('users')
            .select('id, username, avatar_url, role_id')
            .ilike('username', `%${query}%`)
            .limit(10);

          if (excludeCurrentUser && user?.id) {
            queryBuilder = queryBuilder.neq('id', user.id);
          }

          const { data, error } = await queryBuilder;

          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('Failed to search users:', error);
          return [];
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);