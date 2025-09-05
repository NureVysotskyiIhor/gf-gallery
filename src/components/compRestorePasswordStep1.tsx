// src/components/compRestorePasswordStep1.tsx
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Mail, KeyRound, ArrowLeft, Send } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Компонент для анимированных частиц
function RestoreParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        >
          <KeyRound 
            className="w-3 h-3 text-amber-400 animate-pulse" 
            style={{ 
              animationDuration: `${2 + Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Компонент загрузочного состояния
function RestoreLoadingOverlay() {
  const { t } = useTranslation();
  
  return (
    <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-amber-200 dark:border-amber-800 border-t-amber-600 dark:border-t-amber-400 rounded-full animate-spin"></div>
          <Send className="w-6 h-6 text-amber-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">{t('sendingEmail')}</p>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map(i => (
              <div 
                key={i}
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompRestorePasswordStep1() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t('emailRequiredError'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('invalidEmailError'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/route-restore-password-step2`,
      });

      if (error) {
        setError(error.message);
        toast.error(t('error'), { description: error.message });
      } else {
        setSuccess(true);
        toast.success(t('emailSentSuccess'), {
          description: t('checkEmailInstructions'),
        });
      }
    } catch (err) {
      setError(t('errorOccurred'));
      toast.error(t('error'), { description: String(err) });
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="relative bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 border-0 shadow-2xl p-8 rounded-2xl w-full max-w-md mx-auto backdrop-blur-sm">
        <Link 
          to="/" 
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
        >
          <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
        </Link>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('emailSent')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {t('emailSentDescription')}{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{email}</span>
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
            <p className="text-green-700 dark:text-green-400 text-sm">
              {t('checkSpamFolder')}
            </p>
          </div>
          <Link 
            to="/route-login" 
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-semibold transition-colors hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 dark:from-gray-900 dark:via-amber-900/10 dark:to-orange-900/10 border-0 shadow-2xl p-8 rounded-2xl w-full max-w-md mx-auto backdrop-blur-sm overflow-hidden">
      {/* Background particles */}
      <RestoreParticles />
      
      {/* Loading overlay */}
      {loading && <RestoreLoadingOverlay />}

      {/* Close button */}
      <Link 
        to="/" 
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10 group"
      >
        <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
      </Link>

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {t('forgotPasswordTitle')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">
          {t('forgotPasswordDescription')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
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
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              className={`pl-11 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-amber-500 transition-all duration-200 ${
                error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-700 dark:text-red-400 text-sm font-medium text-center">
              {error}
            </p>
          </div>
        )}

        {/* Submit button */}
        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {t('sendingEmail')}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              {t('continue')}
            </div>
          )}
        </Button>
      </form>

      {/* Back to login link */}
      <div className="text-center mt-6 relative z-10">
        <Link 
          to="/route-login" 
          className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-semibold transition-colors hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  );
}