//src\components\compCompleteProfileForm.tsx
import { useNavigate } from '@tanstack/react-router';
import { useUserStore } from '@/store/userStore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import {
//   Select, SelectTrigger, SelectValue, SelectContent, SelectItem
// } from '@/components/ui/select';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { 
  User, 
  UserCheck, 
  Sparkles, 
  Users, 
  Shield,
  CheckCircle,
  ArrowRight,
  Stars,
  Wand2,
  Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Assuming you're using react-i18next

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Компонент для анимированных частиц
function CompleteProfileParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        >
          <Stars 
            className="w-3 h-3 text-indigo-400 animate-pulse" 
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
function CompleteProfileLoadingOverlay() {
  const { t } = useTranslation();
  
  return (
    <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-30">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
          <Wand2 className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-lg text-gray-800 dark:text-gray-200 font-semibold">{t('completeProfile.finishingSetup')}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('completeProfile.creatingPersonalProfile')}</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i}
              className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Компонент скелетона для полей
function FieldSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/3 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-500/30 to-transparent animate-[shimmer_1.5s_infinite]"></div>
      </div>
      <div className="h-14 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-500/30 to-transparent animate-[shimmer_2s_infinite]"></div>
      </div>
    </div>
  );
}

export function CompCompleteProfileForm() {
  const { t } = useTranslation();
  const setUser = useUserStore(s => s.setUser);
  const navigate = useNavigate();

  // ROLE LIMITATION: Only visitor role available for profile completion
  // To restore all roles, uncomment the full roles array below and comment out the restricted one
  
  // Full roles array (commented out for restriction):
  /*
  const roles = [
    { 
      id: 1, 
      name: 'visitor', 
      label: t('roles.visitor.label'), 
      icon: Users, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      description: t('roles.visitor.description')
    },
    { 
      id: 2, 
      name: 'artist', 
      label: t('roles.artist.label'), 
      icon: Palette, 
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      description: t('roles.artist.description')
    },
    { 
      id: 3, 
      name: 'admin', 
      label: t('roles.admin.label'), 
      icon: Crown, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      description: t('roles.admin.description')
    },
  ];
  */
  
  // Restricted roles (only visitor):
  // const roles = [
  //   { 
  //     id: 1, 
  //     name: 'visitor', 
  //     label: t('roles.visitor.label'), 
  //     icon: Users, 
  //     color: 'text-blue-500',
  //     bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  //     borderColor: 'border-blue-200 dark:border-blue-800',
  //     description: t('roles.visitor.description')
  //   },
  // ];

  const [form, setForm] = useState({ role: '1', username: '' }); // Default to visitor role
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fieldValidation, setFieldValidation] = useState<Record<string, boolean>>({ role: true }); // Role pre-validated since it's fixed
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Simulate initial loading and get user info
  useEffect(() => {
    const initializeForm = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          setForm(prev => ({
            ...prev,
            username: user.user_metadata?.full_name || user.user_metadata?.name || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setTimeout(() => setInitialLoading(false), 1000); // Simulate loading time
      }
    };

    initializeForm();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    
    // Real-time validation
    if (name === 'username' && value) {
      setFieldValidation(prev => ({ ...prev, username: value.trim().length >= 2 }));
    }
  };

  // const handleRoleChange = (value: string) => {
  //   setForm(f => ({ ...f, role: value }));
  //   setFieldValidation(prev => ({ ...prev, role: true }));
  // };

  const validate = () => {
    if (!form.role) {
      toast.error(t('completeProfile.validation.roleRequired'));
      return false;
    }
    if (form.username && form.username.trim().length < 2) {
      toast.error(t('completeProfile.validation.usernameMinLength'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error(t('completeProfile.errors.failedToGetUser'));
        setLoading(false);
        return;
      }

      const updates = {
        id: user.id,
        email: user.email ?? '',
        username: form.username.trim() || user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        role_id: Number(form.role), // Will always be 1 (visitor) due to restriction
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase.from('users').upsert(updates);
      if (upsertError) {
        toast.error(t('completeProfile.errors.savingError', { error: upsertError.message }));
        setLoading(false);
        return;
      }

      setUser(updates);
      toast.success(t('completeProfile.success.profileSetup'));
      
      // Smooth transition to home
      setTimeout(() => {
        navigate({ to: '/' });
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('completeProfile.errors.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  //const selectedRole = roles.find(r => r.id.toString() === form.role);

  // Loading skeleton
  if (initialLoading) {
    return (
      <div className="relative bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-indigo-900/10 dark:to-purple-900/10 border-0 shadow-2xl p-8 rounded-2xl w-full max-w-lg mx-auto backdrop-blur-sm overflow-hidden">
        <CompleteProfileParticles />
        
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 dark:from-indigo-800 to-purple-800 rounded-2xl mx-auto mb-4 animate-pulse flex items-center justify-center">
            <UserCheck className="w-10 h-10 text-indigo-400 animate-pulse" />
          </div>
          <div className="h-8 bg-gradient-to-r from-gray-200 dark:from-gray-700 to-gray-600 rounded-lg w-3/4 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
        </div>

        {/* Form skeleton */}
        <div className="space-y-6">
          <FieldSkeleton />
          <FieldSkeleton />
          
          {/* Button skeleton */}
          <div className="h-14 bg-gradient-to-r from-indigo-200 dark:from-indigo-800 to-purple-800 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-indigo-900/10 dark:to-purple-900/10 border-0 shadow-2xl p-8 rounded-2xl w-full max-w-lg mx-auto backdrop-blur-sm overflow-hidden">
      {/* Background particles */}
      <CompleteProfileParticles />
      
      {/* Loading overlay */}
      {loading && <CompleteProfileLoadingOverlay />}

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl relative">
          <UserCheck className="w-10 h-10 text-white" />
          {/* Success indicator when form is valid */}
          {form.role && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
          {t('completeProfile.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {t('completeProfile.subtitle')}
        </p>
        {currentUser && (
          <div className="mt-4 p-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('completeProfile.greeting', { 
                name: currentUser.user_metadata?.full_name || currentUser.email 
              })}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6 relative z-10" noValidate>
        {/* Role selection - RESTRICTED TO VISITOR ONLY */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {t('completeProfile.fields.role.label')}
            <span className="text-green-500">✓</span>
          </Label>
          
          {/* Option 1: Show role info card instead of select */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-xl">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-blue-800 dark:text-blue-200">
                  {t('roles.visitor.label')}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  {t('roles.visitor.description')}
                </div>
              </div>
              <div className="text-green-500">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {t('completeProfile.roleAutoAssigned')}
              </p>
            </div>
          </div>
          
          {/* Option 2: Keep the select but hide other options (uncomment if preferred) */}
          {/*
          <Select
            value={form.role}
            onValueChange={handleRoleChange}
            disabled={loading}
          >
            <SelectTrigger className="h-14 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200">
              <SelectValue placeholder={t('completeProfile.fields.role.placeholder')}>
                {selectedRole && (
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedRole.bgColor} ${selectedRole.borderColor} border`}>
                      <selectedRole.icon className={`w-4 h-4 ${selectedRole.color}`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{selectedRole.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{selectedRole.description}</div>
                    </div>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.id} value={role.id.toString()} className="py-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${role.bgColor} ${role.borderColor} border`}>
                      <role.icon className={`w-4 h-4 ${role.color}`} />
                    </div>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{role.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          */}
          
          {fieldValidation.role && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{t('completeProfile.validation.roleSelected')}</span>
            </div>
          )}
        </div>

        {/* Username field */}
        <div className="space-y-3">
          <Label htmlFor="username" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {t('completeProfile.fields.username.label')}
            <span className="text-gray-400 text-xs">({t('completeProfile.fields.username.optional')})</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="username"
              name="username"
              type="text"
              placeholder={t('completeProfile.fields.username.placeholder')}
              value={form.username}
              onChange={handleInputChange}
              disabled={loading}
              className={`pl-11 pr-11 h-14 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 ${
                fieldValidation.username ? 'border-green-400 focus:border-green-500' : ''
              }`}
            />
            {fieldValidation.username && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {t('completeProfile.fields.username.hint')}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('completeProfile.progress.label')}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              100% {/* Always 100% since role is pre-selected */}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-green-500 to-green-600"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        {/* Submit button */}
        <Button 
          type="submit" 
          className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group" 
          disabled={loading} // Removed role requirement since it's pre-set
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{t('completeProfile.button.completing')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span>{t('completeProfile.button.complete')}</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          )}
        </Button>

        {/* Help text */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('completeProfile.helpText')}
          </p>
        </div>
      </form>

      {/* Ambient light effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/5 via-purple-400/3 to-transparent rounded-full animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/5 via-indigo-400/3 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}