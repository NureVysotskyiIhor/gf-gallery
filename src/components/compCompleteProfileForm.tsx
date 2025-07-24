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

export function CompCompleteProfileForm() {
  const setUser = useUserStore(s => s.setUser);
  const navigate = useNavigate();

  const [form, setForm] = useState({ role: '', username: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.role) {
      toast.error('Выберите роль');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error('Не удалось получить пользователя');
        setLoading(false);
        return;
      }

      const updates = {
        id: user.id,
        email: user.email ?? '',
        username: form.username || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        role_id: Number(form.role),
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase.from('users').upsert(updates);
      if (upsertError) {
        toast.error(upsertError.message);
        setLoading(false);
        return;
      }

      setUser(updates);
      navigate({ to: '/' });
    } catch {
      toast.error('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-6 p-6 border rounded">
      <h2 className="text-lg font-bold text-center">Завершите регистрацию</h2>

      <div>
        <Label htmlFor="role">Роль (обязательно)</Label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Выберите роль</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="username">Имя пользователя (необязательно)</Label>
        <Input
          id="username"
          name="username"
          placeholder="Ваш никнейм"
          value={form.username}
          onChange={handleInputChange}
        />
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? 'Сохраняем...' : 'Сохранить'}
      </Button>
    </div>
  );
}
