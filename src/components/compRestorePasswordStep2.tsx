import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export function RestorePasswordStep2() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [canReset, setCanReset] = useState(false);
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [errors, setErrors] = useState<{ password?: string; repeat?: string }>({});
  const [error, setError] = useState<string | null>(null);

  // 1) При монтировании проверяем, есть ли сессия
  useEffect(() => {
    (async () => {
      // getSession подтянет созданную автоматически после клика по ссылке recovery
      const { data: { session }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !session) {
        setError('Неверная или просроченная ссылка для сброса пароля.');
      } else {
        setCanReset(true);
      }
      setLoading(false);
    })();
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!password) e.password = 'Введите пароль';
    else if (password.length < 6) e.password = 'Минимум 6 символов';
    if (password !== repeat) e.repeat = 'Пароли не совпадают';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate() || !canReset) return;

    setLoading(true);
    const { error: updErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updErr) {
      setError(updErr.message);
      toast('Ошибка', { description: updErr.message });
    } else {
      toast('Успех', { description: 'Пароль успешно сброшен.' });
      navigate({ to: '/route-login' });
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Загрузка…</div>;
  }

  return (
    <div className="bg-background border border-border p-6 rounded-xl w-full max-w-sm mx-auto shadow-sm relative">
      <Link to="/" className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full">
        <X className="w-5 h-5 text-muted-foreground" />
      </Link>

      {!canReset ? (
        <p className="text-red-500 text-center p-4">
          {error || 'Сессия сброса недоступна.'}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center text-2xl">🔑</div>
          <div className="text-center text-sm mb-2">Придумайте новый пароль</div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="password">Новый пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="repeat">Повторите пароль</Label>
            <Input
              id="repeat"
              type="password"
              placeholder="Повторите пароль"
              value={repeat}
              onChange={e => setRepeat(e.target.value)}
              disabled={loading}
            />
            {errors.repeat && <p className="text-red-500 text-sm">{errors.repeat}</p>}
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-100 p-2 rounded text-center">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Сохранение…' : 'Сбросить пароль'}
          </Button>
        </form>
      )}
    </div>
  );
}
