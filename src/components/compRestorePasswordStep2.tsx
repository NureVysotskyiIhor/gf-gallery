// src/components/compRestorePasswordStep2.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Lock, Eye, EyeOff, Shield, CheckCircle, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Компонент для анимированных частиц
function ResetParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        >
          <Shield 
            className="w-3 h-3 text-green-400 animate-pulse" 
            style={{ 
              animationDuration: `${2 + Math.random() * 3}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Компонент скелетона загрузки
function ResetLoadingSkeleton() {
  
  return (
    <div className="relative bg-gradient-to-br from-white via-gray-50/30 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/30 dark:to-blue-900/10 border-0 shadow-2xl p-8 rounded-2xl w-full max-w-md mx-auto backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            <Sparkles className="w-2 h-2 text-blue-300 animate-pulse" />
          </div>
        ))}
      </div>

      <Link 
        to="/" 
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
      >
        <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
      </Link>

      <div className="text-center mb-8 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-indigo-300 dark:from-blue-800 dark:to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
          <Shield className="w-8 h-8 text-blue-400 animate-pulse" />
        </div>
        <div className="h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse mx-auto mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-12 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-12 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse"></div>
        </div>
        <div className="h-12 bg-gradient-to-r from-green-200 to-emerald-300 dark:from-green-800 dark:to-emerald-700 rounded-xl animate-pulse"></div>
      </div>

      <div className="flex items-center justify-center mt-8">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div 
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Компонент загрузочного состояния для сохранения
function SaveLoadingOverlay() {
  const { t } = useTranslation();
  
  return (
    <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin"></div>
          <CheckCircle className="w-6 h-6 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">{t('savingNewPassword')}</p>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2, 3].map(i => (
              <div 
                key={i}
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompRestorePasswordStep2() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; repeat?: string }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      setLoading(true);
      try {
        const {
          data: { session },
          error: sessErr,
        } = await supabase.auth.getSession();

        if (sessErr || !session) {
          setError(t('invalidOrExpiredLink'));
          setCanReset(false);
        } else {
          setCanReset(true);
        }
      } catch {
        setError(t('errorOccurred'));
        setCanReset(false);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [t]);

  function validate() {
    const e: typeof errors = {};
    if (!password) e.password = t('enterPassword');
    else if (password.length < 6) e.password = t('passwordMinLength');
    if (password !== repeat) e.repeat = t('passwordsDontMatch');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate() || !canReset) return;

    setSaving(true);
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) {
        setError(updErr.message);
        toast.error(t('error'), { description: updErr.message });
      } else {
        toast.success(t('emailSentSuccess'), { description: t('passwordResetSuccess') });
        navigate({ to: '/route-login' });
      }
    } catch (err) {
      setError(t('passwordResetError'));
      toast.error(t('error'), { description: String(err) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ResetLoadingSkeleton />;
  }

  return (
    <div className="relative bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 border-0 shadow-2xl p-8 rounded-2xl w-full max-w-md mx-auto backdrop-blur-sm overflow-hidden">
      <ResetParticles />

      {saving && <SaveLoadingOverlay />}

      <Link
        to="/"
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10 group"
      >
        <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
      </Link>

      {!canReset ? (
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <X className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            {t('invalidOrExpiredLink')}
          </h1>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-700 dark:text-red-400 text-sm text-center">
              {error || t('sessionUnavailable')}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {t('newPassword')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              {t('createSecurePassword')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('newPassword')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={saving}
                  className={`pl-11 pr-11 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 transition-all duration-200 ${
                    errors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="repeat"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('repeatPassword')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="repeat"
                  type="password"
                  placeholder="••••••••"
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  disabled={saving}
                  className={`pl-11 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 transition-all duration-200 ${
                    errors.repeat
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
              </div>
              {errors.repeat && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.repeat}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium text-center">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform"
              disabled={saving}
            >
              {saving ? t('savingNewPassword') : t('resetPassword')}
            </Button>
          </form>

          <div className="text-center mt-6 relative z-10">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('dontHaveAccount')}{' '}
              <Link
                to="/route-register"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors hover:underline"
              >
                {t('register')}
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}