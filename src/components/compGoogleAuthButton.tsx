// src/components/compGoogleAuthButton.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Chrome, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from 'react-i18next';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Компонент для анимированных частиц Google
function GoogleParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-30"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        >
          <div
            className="w-1 h-1 rounded-full animate-pulse"
            style={{
              backgroundColor: ['#4285F4', '#EA4335', '#FBBC04', '#34A853'][i % 4],
              animationDuration: `${1.5 + Math.random() * 1}s`
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Компонент загрузочного состояния для Google Auth
function GoogleLoadingOverlay() {
  const { t } = useTranslation();
  
  return (
    <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 border-3 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          <Chrome className="w-4 h-4 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('googleAuthConnecting')}</p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div 
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ 
                backgroundColor: ['#4285F4', '#EA4335', '#FBBC04'][i],
                animationDelay: `${i * 0.15}s` 
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Компонент для уже авторизованного пользователя
function AlreadyAuthenticatedState() {
  const { t } = useTranslation();
  
  return (
    <div className="absolute inset-0 bg-green-50/90 dark:bg-green-900/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <CheckCircle className="w-8 h-8 text-green-500 animate-bounce" />
        <p className="text-xs text-green-600 dark:text-green-400 font-medium">{t('alreadyAuthenticated')}</p>
      </div>
    </div>
  );
}

export function CompGoogleAuthButton() {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Функция для проверки профиля пользователя
  const checkUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('username, avatar_url, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking profile:', error);
        return false;
      }

      // Считаем профиль заполненным, если есть username
      return !!(profile?.username && profile.username.trim().length > 0);
    } catch (error) {
      console.error('Error in checkUserProfile:', error);
      return false;
    }
  };

  // Проверяем авторизацию при загрузке компонента
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          setCheckingProfile(true);
          
          // Проверяем профиль
          const hasProfile = await checkUserProfile(session.user.id);
          
          if (hasProfile) {
            toast.success(t('welcomeBack'));
            navigate({ to: '/route-main-paintings' });
          } else {
            // Профиль не заполнен, но не редиректим сразу
            console.log('Profile incomplete, user can complete it manually');
          }
          
          setCheckingProfile(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setCheckingProfile(false);
      }
    };

    checkAuth();
  }, [navigate, t]);

  // Слушаем изменения состояния авторизации
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setIsAuthenticated(true);
          setLoading(false);
          setCheckingProfile(true);
          
          try {
            // Небольшая задержка, чтобы данные успели записаться
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const hasProfile = await checkUserProfile(session.user.id);
            
            if (hasProfile) {
              toast.success(t('successfulLogin'));
              navigate({ to: '/route-main-paintings' });
            } else {
              toast.info(t('completingProfileSetup'));
              navigate({ to: '/route-complete-profile' });
            }
          } catch (error) {
            console.error('Error processing auth:', error);
            // В случае ошибки отправляем на заполнение профиля
            navigate({ to: '/route-complete-profile' });
          } finally {
            setCheckingProfile(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setLoading(false);
          setCheckingProfile(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, t]);

  const handleClick = async () => {
    // Если уже авторизован, проверяем профиль и редиректим
    if (isAuthenticated) {
      setCheckingProfile(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const hasProfile = await checkUserProfile(session.user.id);
          
          if (hasProfile) {
            toast.info(t('redirectingToGallery'));
            navigate({ to: '/route-main-paintings' });
          } else {
            toast.info(t('profileSetupRequired'));
            navigate({ to: '/route-complete-profile' });
          }
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        toast.error(t('profileCheckError'));
      } finally {
        setCheckingProfile(false);
      }
      return;
    }

    setLoading(true);
    console.log('Starting Google auth process...');
    
    try {
      // Принудительно выходим из текущей сессии перед новой авторизацией
      await supabase.auth.signOut();
      
      // Используем универсальный callback URL, который будет обрабатывать логику
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          // Используем hash-based redirect для SPA
          redirectTo: window.location.origin + '/callback',
          // Принудительно показываем окно выбора аккаунта
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          },
          // Указываем, что хотим получить refresh token
          scopes: 'openid email profile'
        },
      });

      console.log('Google auth initiated', error);
      
      if (error) throw error;
      
      // Не сбрасываем loading здесь, так как произойдет редирект
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error(error.message || t('authorizationError'));
      setLoading(false);
    }
  };

  const isProcessing = loading || checkingProfile;

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className="w-full h-12 relative overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={handleClick} 
        disabled={isProcessing}
      >
        {/* Background particles */}
        {!isProcessing && !isAuthenticated && <GoogleParticles />}
        
        {/* Loading overlay */}
        {loading && <GoogleLoadingOverlay />}
        
        {/* Checking profile overlay */}
        {checkingProfile && (
          <div className="absolute inset-0 bg-blue-50/90 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t('checkingProfile')}</p>
            </div>
          </div>
        )}
        
        {/* Already authenticated overlay */}
        {isAuthenticated && !isProcessing && <AlreadyAuthenticatedState />}
        
        {/* Button content */}
        <div className={`flex items-center gap-3 relative z-10 transition-opacity duration-200 ${isProcessing || isAuthenticated ? 'opacity-0' : 'opacity-100'}`}>
          <div className="relative">
            <svg 
              className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" 
              viewBox="0 0 24 24"
            >
              <path 
                fill="#4285F4" 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path 
                fill="#34A853" 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path 
                fill="#FBBC05" 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path 
                fill="#EA4335" 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
          </div>
          
          <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {isAuthenticated ? t('goToGallery') : t('signInWithGoogle')}
          </span>
          
          <Sparkles className="w-4 h-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12" />
        </div>
      </Button>
    </div>
  );
}