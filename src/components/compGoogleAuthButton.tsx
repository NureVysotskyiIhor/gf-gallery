// src/components/compGoogleAuthButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export function GoogleAuthButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/route-complete-profile' },
    });
    setLoading(false);
    if (error) toast('Ошибка', { description: error.message });
    // дальше всё «автоматом»: Google → ваш redirectTo → авто‑сессия → fetchUser()
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleClick} disabled={loading}>
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.24 10.4V14.8H16.4C...z" />
      </svg>
      {loading ? 'Переходим...' : 'Войти через Google'}
    </Button>
  );
}
