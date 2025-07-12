// src/components/compCompleteProfileForm.tsx
import { useNavigate } from '@tanstack/react-router';
import { useUserStore } from '@/store/userStore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const roles = [
  { id: 1, name: 'visitor' },
  { id: 2, name: 'artist' },
  { id: 3, name: 'admin' },
];

export function CompleteProfileForm() {
  const setUser = useUserStore(s => s.setUser);
  const navigate = useNavigate();

  const [role, setRole] = useState<string>('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!role) {
      toast('Ошибка', { description: 'Выберите роль' });
      return;
    }

    setLoading(true);

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      toast('Ошибка', { description: 'Не удалось получить пользователя' });
      setLoading(false);
      return;
    }

    const updates = {
      id: user.id,
      email: user.email ?? '',
      username: username || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      role_id: Number(role),
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase.from('users').upsert(updates);
    if (upsertError) {
      toast('Ошибка', { description: upsertError.message });
      setLoading(false);
      return;
    }

    setUser(updates);
    navigate({ to: '/' });
  };

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-6 p-6 border rounded">
      <h2 className="text-lg font-bold text-center">Завершите регистрацию</h2>

      <div>
        <Label>Роль (обязательно)</Label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Выберите роль</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>Имя пользователя (необязательно)</Label>
        <Input
          placeholder="Ваш никнейм"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? 'Сохраняем...' : 'Сохранить'}
      </Button>
    </div>
  );
}
