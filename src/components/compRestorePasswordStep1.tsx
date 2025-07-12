// src/components/compRestorePasswordStep1.tsx
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function RestorePasswordStep1() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email обязателен');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Невалидный email');
      return;
    }

    setLoading(true);
    // опция shouldCreateSession пока не поддерживается
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/route-restore-password-step2`,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      toast('Ошибка', { description: error.message });
    } else {
      toast('Письмо отправлено', {
        description: 'Проверьте почту и следуйте инструкциям.',
      });
    }
  };

  return (
    <div className="bg-background border border-border p-6 rounded-xl w-full max-w-sm mx-auto shadow-sm relative">
      <Link to="/" className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full">
        <X className="w-5 h-5 text-muted-foreground" />
      </Link>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center text-2xl">🔒</div>
        <div className="text-center text-sm mb-2">
          Введите email — мы вышлем ссылку для сброса пароля
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm bg-red-100 p-2 rounded text-center">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Отправка...' : 'Продолжить'}
        </Button>
      </form>
      <Link to="/route-login" className="block text-center text-sm underline mt-4">
        ← Вернуться к входу
      </Link>
    </div>
  );
}
