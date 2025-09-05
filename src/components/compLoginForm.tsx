// src/components/compLoginForm.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Eye, EyeOff, Mail, Lock, LogIn, Shield } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useUserStore } from '@/store/userStore';
import { CompGoogleAuthButton } from '@/components/compGoogleAuthButton';
import { LoginParticles } from "@/components/functions/loading"
import { useTranslation } from 'react-i18next';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Компонент загрузочного состояния
function LoadingOverlay() {
  const { t } = useTranslation();
  
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          <Shield className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('signingIn')}</p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div 
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CompLoginForm() {
  const navigate = useNavigate();
  const setUser = useUserStore(s => s.setUser);
  const { t } = useTranslation();

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
      setError(t('emailRequired'));
      return;
    }
    if (!password) {
      setError(t('passwordRequired'));
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !data.user) {
        setError(signInError?.message ?? t('authorizationError'));
        return;
      }

      const { data: profile, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (fetchErr || !profile) {
        setError(fetchErr?.message ?? t('failedToLoadProfile'));
        return;
      }

      setUser(profile);
      navigate({ to: '/' });
    } catch {
      setError(t('unknownError'));
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
    <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10 border-0 shadow-2xl p-8 rounded-2xl w-full max-w-md mx-auto backdrop-blur-sm overflow-hidden">
      {/* Background particles */}
      <LoginParticles />
      
      {/* Loading overlay */}
      {loading && <LoadingOverlay />}

      {/* Close button */}
      <Link 
        to="/" 
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-20 group"
      >
        <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
      </Link>

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {t('welcome')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          {t('loginToAccount')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10" noValidate>
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('emailAddress')}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
              required
              className={`pl-11 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                error && !email ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('password')}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              disabled={loading}
              required
              className={`pl-11 pr-11 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                error && !password ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Forgot password link */}
        <div className="text-right">
          <Link 
            to="/route-restore-password-step1" 
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors hover:underline"
          >
            {t('forgotPassword')}
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4" role="alert">
            <p className="text-red-700 dark:text-red-400 text-sm font-medium text-center">
              {error}
            </p>
          </div>
        )}

        {/* Submit button */}
        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {t('signingIn')}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              {t('loginIn')}
            </div>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-8 relative z-10">
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
        <span className="px-4 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700">
          {t('or')}
        </span>
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
      </div>

      {/* Google auth */}
      <div className="relative z-10">
        <CompGoogleAuthButton />
      </div>

      {/* Register link */}
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
    </div>
  );
}