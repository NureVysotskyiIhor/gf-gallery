// src/routes/auth/callback.tsx
import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Chrome, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

function AuthCallbackComponent() {
  const [status, setStatus] = useState<'loading' | 'checking' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Обрабатываем авторизацию...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setMessage('Получаем данные пользователя...');

        // Supabase автоматически обрабатывает OAuth callback
        // Просто проверяем текущую сессию
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        // Если сессии нет, ждем её появления
        if (!session) {
          console.log('No session found, waiting for auth state change...');
          
          // Ждем изменения состояния авторизации
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
              console.log('Auth state change in callback:', event, newSession?.user?.email);
              
              if (event === 'SIGNED_IN' && newSession?.user) {
                subscription.unsubscribe();
                await processUser(newSession.user);
              } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
                // Игнорируем эти события в callback
                return;
              }
            }
          );

          // Таймаут на случай, если ничего не произойдет
          setTimeout(() => {
            subscription.unsubscribe();
            if (status === 'loading') {
              throw new Error('Превышено время ожидания авторизации');
            }
          }, 10000);

          return;
        }

        // Если сессия уже есть, обрабатываем пользователя
        await processUser(session.user);

      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Произошла ошибка при авторизации');
        toast.error('Ошибка авторизации');

        // Через 3 секунды перенаправляем на страницу входа
        setTimeout(() => {
          navigate({ to: '/route-login' });
        }, 3000);
      }
    };

    const processUser = async (user: any) => {
      try {
        setStatus('checking');
        setMessage('Проверяем профиль...');

        // Небольшая задержка для записи данных в БД
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Проверяем, есть ли профиль пользователя
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('username, avatar_url, email')
          .eq('id', user.id)
          .single();

        console.log('Profile check result:', { profile, profileError });

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking profile:', profileError);
          // Не считаем это критической ошибкой, продолжаем
        }

        const hasCompleteProfile = profile?.username && profile.username.trim().length > 0;

        setStatus('success');

        if (hasCompleteProfile) {
          setMessage('Добро пожаловать! Переходим в галерею...');
          toast.success('Успешный вход в систему!');
          
          setTimeout(() => {
            navigate({ to: '/route-main-paintings' });
          }, 1500);
        } else {
          setMessage('Завершаем настройку профиля...');
          toast.info('Давайте завершим настройку профиля');
          
          setTimeout(() => {
            navigate({ to: '/route-complete-profile' });
          }, 1500);
        }

      } catch (error: any) {
        console.error('Error processing user:', error);
        setStatus('error');
        setMessage(error.message || 'Ошибка при обработке данных пользователя');
        toast.error('Ошибка обработки данных');

        setTimeout(() => {
          navigate({ to: '/route-login' });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
      case 'checking':
        return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      default:
        return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
      case 'checking':
        return 'from-blue-500/20 to-blue-600/20';
      case 'success':
        return 'from-green-500/20 to-green-600/20';
      case 'error':
        return 'from-red-500/20 to-red-600/20';
      default:
        return 'from-blue-500/20 to-blue-600/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 via-purple-400/3 to-transparent rounded-full animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/5 via-pink-400/3 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 max-w-md w-full">
        <div className={`bg-gradient-to-br ${getStatusColor()} backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 text-center`}>
          {/* Google branding */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Chrome className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Google Auth</span>
          </div>

          {/* Status icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Message */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {status === 'loading' && 'Авторизация...'}
            {status === 'checking' && 'Проверяем данные...'}
            {status === 'success' && 'Успешно!'}
            {status === 'error' && 'Ошибка'}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {/* Progress indicators */}
          {(status === 'loading' || status === 'checking') && (
            <div className="flex justify-center gap-1 mb-4">
              {[0, 1, 2].map(i => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce bg-blue-500"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}

          {/* Google particles effect */}
          {status === 'success' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                >
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: ['#4285F4', '#EA4335', '#FBBC04', '#34A853'][i % 4],
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Additional info */}
          {status === 'error' && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Автоматически перенаправляем на страницу входа...
            </p>
          )}

          {/* Debug info in development */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left">
              <p>URL: {window.location.href}</p>
              <p>Hash: {window.location.hash}</p>
              <p>Search: {window.location.search}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/callback')({
  component: AuthCallbackComponent,
});