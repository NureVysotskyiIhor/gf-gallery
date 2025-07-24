// src/store/userStore.ts
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import type { ExtendedUser } from '@/lib/types/userTypes';
import type { NavigateFn } from '@tanstack/react-router';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface UserState {
  user: ExtendedUser | null;
  setUser: (user: ExtendedUser | null) => void;
  fetchUser: (navigate: NavigateFn) => Promise<void>;
  updateUserProfile: (updates: {
    username?: string;
    avatar_url?: string;
    bio?: string;
  }) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,

  setUser: (user) => set({ user }),

  fetchUser: async (navigate) => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      set({ user: null });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
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

    set({ user: fullUser });
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

    // Обновим локальный стейт
    const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
    set({ user: updatedUser });
  },
}));
