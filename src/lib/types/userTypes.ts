export interface ExtendedUser {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role_id: number | null;
  created_at: string | null;
  updated_at: string | null;
}