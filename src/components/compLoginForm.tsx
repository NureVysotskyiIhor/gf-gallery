import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useUserStore } from '@/store/userStore';
import { CompGoogleAuthButton } from '@/components/compGoogleAuthButton';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export function CompLoginForm() {
  const navigate = useNavigate();
  const setUser = useUserStore(s => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email обязателен');
      return;
    }
    if (!password) {
      setError('Пароль обязателен');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !data.user) {
        setError(signInError?.message ?? 'Ошибка авторизации');
        return;
      }

      const { data: profile, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (fetchErr || !profile) {
        setError(fetchErr?.message ?? 'Не удалось загрузить профиль');
        return;
      }

      setUser(profile);
      navigate({ to: '/' });
    } catch {
      setError('Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="bg-background border border-border p-6 rounded-xl w-full max-w-sm mx-auto shadow-sm relative">
      <Link to="/" className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full">
        <X className="w-5 h-5 text-muted-foreground" />
      </Link>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="flex flex-col gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="password">Пароль</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Введите пароль"
              value={password}
              onChange={handlePasswordChange}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Link to="/route-restore-password-step1" className="block text-right text-sm text-blue-500 underline">
          Forgot password?
        </Link>

        {error && (
          <p className="text-red-500 text-sm bg-red-100 p-2 rounded text-center" role="alert">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </Button>
      </form>

      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-border" />
        <span className="px-2 text-xs text-muted-foreground">OR</span>
        <div className="flex-grow h-px bg-border" />
      </div>

      <CompGoogleAuthButton />

      <Link to="/route-register" className="block text-center text-sm underline">
        Нет аккаунта? Зарегистрироваться
      </Link>
    </div>
  );
}
