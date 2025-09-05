//src\components\compRegisterForm.tsx
import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
// import {
//   Select, SelectTrigger, SelectValue, SelectContent, SelectItem
// } from '@/components/ui/select';
import { X, Eye, EyeOff, User, Mail, Lock, Shield, UserPlus, Sparkles, Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useUserStore } from '@/store/userStore';
import { CompGoogleAuthButton } from '@/components/compGoogleAuthButton';
import { useTranslation } from 'react-i18next';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Компонент для анимированных частиц
function RegisterParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        >
          <Sparkles 
            className="w-2 h-2 text-purple-400 animate-pulse" 
            style={{ 
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Компонент загрузочного состояния
function RegisterLoadingOverlay() {
  const { t } = useTranslation();
  
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
          <Shield className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('creatingAccount')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('thisWillTakeSeconds')}</p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div 
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CompRegisterForm() {
  const navigate = useNavigate();
  const setUser = useUserStore(s => s.setUser);
  const { t } = useTranslation();

  // ROLE LIMITATION: Only visitor role available for registration
  // To restore all roles, uncomment the full roles array below and comment out the restricted one
  
  // Full roles array (commented out for restriction):
  /*
  const roles = [
    { id: 1, name: 'visitor', label: t('visitor'), icon: Users, color: 'text-blue-500' },
    { id: 2, name: 'artist', label: t('artist'), icon: Palette, color: 'text-green-500' },
    { id: 3, name: 'admin', label: t('administrator'), icon: Crown, color: 'text-purple-500' },
  ];
  */
  
  // Restricted roles (only visitor):
  // const roles = [
  //   { id: 1, name: 'visitor', label: t('visitor'), icon: Users, color: 'text-blue-500' },
  // ];

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    repeat: '',
    role: '1' // Default to visitor role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldValidation, setFieldValidation] = useState<Record<string, boolean>>({});

  const onChange = (key: string, v: string) => {
    setForm(f => ({ ...f, [key]: v }));
    setErrors(e => ({ ...e, [key]: '' }));
    
    // Real-time validation feedback
    if (key === 'email' && v) {
      setFieldValidation(prev => ({ ...prev, email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }));
    }
    if (key === 'username' && v) {
      setFieldValidation(prev => ({ ...prev, username: v.trim().length > 0 }));
    }
    if (key === 'password' && v) {
      setFieldValidation(prev => ({ ...prev, password: v.length >= 6 }));
    }
    if (key === 'repeat' && v) {
      setFieldValidation(prev => ({ ...prev, repeat: v === form.password }));
    }
  };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = t('enterCorrectEmail');
    if (form.username.trim() === '') e.username = t('usernameRequired');
    if (form.username.trim().length < 3) e.username = t('usernameMinLength');
    if (form.password.length < 6) e.password = t('passwordMinLengthError');
    if (form.password !== form.repeat) e.repeat = t('passwordsDontMatch');
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
        setError(error?.message ?? t('accountCreationError'));
        return;
      }

      const updates = {
        id: data.user.id,
        email: data.user.email,
        username: form.username,
        role_id: Number(form.role), // Will always be 1 (visitor) due to restriction
        updated_at: new Date().toISOString()
      };
      const { error: upErr } = await supabase.from('users').upsert(updates);
      if (upErr) {
        setError(upErr.message);
        return;
      }

      const { data: profile, error: pfErr } = await supabase
        .from('users').select('*').eq('id', data.user.id).single();
      if (pfErr || !profile) {
        setError(pfErr?.message ?? t('failedToLoadProfile'));
        return;
      }

      setUser(profile);
      navigate({ to: '/' });
    } catch (err: any) {
      setError(err.message || t('unknownErrorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  //const selectedRole = roles.find(r => r.id.toString() === form.role);

  return (
    <div className="relative bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-indigo-900/10 border-0 shadow-2xl p-8 rounded-2xl w-full max-w-md mx-auto backdrop-blur-sm overflow-hidden">
      {/* Background particles */}
      <RegisterParticles />
      
      {/* Loading overlay */}
      {loading && <RegisterLoadingOverlay />}

      {/* Close button */}
      <Link 
        to="/" 
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10 group"
      >
        <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
      </Link>

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {t('createAccountTitle')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          {t('joinOurCommunity')}
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6 relative z-10" noValidate>
        {/* Username field */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('username')}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="username"
              type="text"
              placeholder={t('enterUsername')}
              value={form.username}
              onChange={e => onChange('username', e.target.value)}
              disabled={loading}
              required
              className={`pl-11 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 ${
                errors.username ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
              } ${
                fieldValidation.username ? 'border-green-400 focus:border-green-500' : ''
              }`}
            />
            {fieldValidation.username && !errors.username && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.username && (
            <p className="text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-1">
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
              {errors.username}
            </p>
          )}
        </div>

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
              value={form.email}
              onChange={e => onChange('email', e.target.value)}
              disabled={loading}
              required
              className={`pl-11 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 ${
                errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
              } ${
                fieldValidation.email ? 'border-green-400 focus:border-green-500' : ''
              }`}
            />
            {fieldValidation.email && !errors.email && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.email && (
            <p className="text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-1">
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
              {errors.email}
            </p>
          )}
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
              placeholder={t('createStrongPassword')}
              value={form.password}
              onChange={e => onChange('password', e.target.value)}
              disabled={loading}
              required
              className={`pl-11 pr-11 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 ${
                errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
              } ${
                fieldValidation.password ? 'border-green-400 focus:border-green-500' : ''
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
          {errors.password && (
            <p className="text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-1">
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
              {errors.password}
            </p>
          )}
          {form.password && (
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    form.password.length >= i * 2 
                      ? form.password.length >= 8 
                        ? 'bg-green-500' 
                        : form.password.length >= 6 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Repeat password field */}
        <div className="space-y-2">
          <Label htmlFor="repeat" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('repeatPassword')}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="repeat"
              type={showRepeatPassword ? 'text' : 'password'}
              placeholder={t('repeatPasswordPlaceholder')}
              value={form.repeat}
              onChange={e => onChange('repeat', e.target.value)}
              disabled={loading}
              required
              className={`pl-11 pr-11 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 ${
                errors.repeat ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
              } ${
                fieldValidation.repeat && form.repeat ? 'border-green-400 focus:border-green-500' : ''
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              onClick={() => setShowRepeatPassword(v => !v)}
              tabIndex={-1}
              aria-label={showRepeatPassword ? t('hidePassword') : t('showPassword')}
            >
              {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.repeat && (
            <p className="text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-1">
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
              {errors.repeat}
            </p>
          )}
        </div>

        {/* Role selection - RESTRICTED TO VISITOR ONLY */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('selectRole')}
          </Label>
          
          {/* Option 1: Hide the select completely and show info message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t('visitor')}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  {t('defaultRoleForNewUsers')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Option 2: Keep the select but disable other options (uncomment if preferred) */}
          {/*
          <Select
            value={form.role}
            onValueChange={v => onChange('role', v)}
            disabled={loading}
          >
            <SelectTrigger className="h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500">
              <SelectValue>
                {selectedRole && (
                  <div className="flex items-center gap-2">
                    <selectedRole.icon className={`w-4 h-4 ${selectedRole.color}`} />
                    <span>{selectedRole.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {roles.map(r => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  <div className="flex items-center gap-2">
                    <r.icon className={`w-4 h-4 ${r.color}`} />
                    <span>{r.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          */}
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
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {t('creatingAccount')}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              {t('register')}
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

      {/* Login link */}
      <div className="text-center mt-6 relative z-10">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('alreadyHaveAccount')}{' '}
          <Link 
            to="/route-login" 
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold transition-colors hover:underline"
          >
            {t('logIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}