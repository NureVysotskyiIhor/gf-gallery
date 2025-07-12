// src/store/userStore.ts
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import type { NavigateFn } from '@tanstack/react-router';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface ExtendedUser {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role_id: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserState {
  user: ExtendedUser | null;
  setUser: (user: ExtendedUser | null) => void;
  fetchUser: (navigate: NavigateFn) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  fetchUser: async (navigate) => {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      set({ user: null });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    // ❗️Профиля нет — значит вход через Google впервые
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
}));
