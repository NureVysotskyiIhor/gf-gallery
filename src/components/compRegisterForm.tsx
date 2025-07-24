import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select';
import { X, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useUserStore } from '@/store/userStore';
import { CompGoogleAuthButton } from '@/components/compGoogleAuthButton';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const roles = [
  { id: 1, name: 'visitor' },
  { id: 2, name: 'admin' },
  { id: 3, name: 'artist' },
];

export function CompRegisterForm() {
  const navigate = useNavigate();
  const setUser = useUserStore(s => s.setUser);

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    repeat: '',
    role: '1'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (key: string, v: string) => {
    setForm(f => ({ ...f, [key]: v }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Невалидный email';
    if (form.username.trim() === '') e.username = 'Имя обязательно';
    if (form.password.length < 6) e.password = 'Минимум 6 символов';
    if (form.password !== form.repeat) e.repeat = 'Пароли не совпадают';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password
      });
      if (error || !data.user) {
        setError(error?.message ?? 'Ошибка регистрации');
        setLoading(false);
        return;
      }

      const updates = {
        id: data.user.id,
        email: data.user.email,
        username: form.username,
        role_id: Number(form.role),
        updated_at: new Date().toISOString()
      };
      const { error: upErr } = await supabase.from('users').upsert(updates);
      if (upErr) {
        setError(upErr.message);
        setLoading(false);
        return;
      }

      const { data: profile, error: pfErr } = await supabase
        .from('users').select('*').eq('id', data.user.id).single();
      if (pfErr || !profile) {
        setError(pfErr?.message ?? 'Не удалось получить профиль');
        setLoading(false);
        return;
      }

      setUser(profile);
      navigate({ to: '/' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background border border-border p-6 rounded-xl w-full max-w-sm mx-auto shadow-sm relative">
      <Link to="/" className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full">
        <X className="w-5 h-5 text-muted-foreground" />
      </Link>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="username">Имя пользователя</Label>
          <Input
            id="username"
            placeholder="Введите имя"
            value={form.username}
            onChange={e => onChange('username', e.target.value)}
            disabled={loading}
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email" type="email" placeholder="Введите email"
            value={form.email} onChange={e => onChange('email', e.target.value)}
            disabled={loading}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="password">Пароль</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Введите пароль"
              value={form.password}
              onChange={e => onChange('password', e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="repeat">Повторите пароль</Label>
          <Input
            id="repeat"
            type="password"
            placeholder="Повторите пароль"
            value={form.repeat}
            onChange={e => onChange('repeat', e.target.value)}
            disabled={loading}
          />
          {errors.repeat && <p className="text-red-500 text-sm">{errors.repeat}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <Label>Роль</Label>
          <Select
            value={form.role}
            onValueChange={v => onChange('role', v)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите роль" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(r => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-100 p-2 rounded text-center">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </form>

      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-border" />
        <span className="px-2 text-xs text-muted-foreground">OR</span>
        <div className="flex-grow h-px bg-border" />
      </div>

      <CompGoogleAuthButton/>

      <Link to="/route-login" className="block text-center text-sm underline">
        Уже есть аккаунт? Войти
      </Link>
    </div>
  );
}
