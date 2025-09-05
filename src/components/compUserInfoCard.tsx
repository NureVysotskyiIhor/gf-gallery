// src/components/compUserInfoCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { CompUserEditDialog } from "./compUserEditDialog";
import { Button } from "./ui/button";
import { 
  Edit3, 
  Calendar, 
  Mail, 
  User, 
  Clock, 
  Sparkles,
  Copy,
  Check
} from "lucide-react";
import type { ExtendedUser } from "@/lib/types/userTypes";
import { WaveLoader } from "@/components/functions/loading";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function CompUserInfoCard({ 
  user, 
  loading = false 
}: { 
  user: ExtendedUser | null; 
  loading?: boolean; 
}) {
  const { t } = useTranslation();
  const [openEdit, setOpenEdit] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Animation on mount
  useEffect(() => {
    if (!loading && user) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  // Copy username function
  const copyUsername = async () => {
    if (!user?.username) return;
    
    try {
      await navigator.clipboard.writeText(user.username);
      setCopied(true);
      toast.success(t('usernameCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy username:', err);
      toast.error(t('error'));
    }
  };

  // Loading skeleton with enhanced animations
  if (loading || !user) {
    return (
      <Card className="max-w-2xl mx-auto overflow-hidden bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-blue-900/20 border-0 shadow-2xl backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Animated header */}
          <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-8">
            {/* Enhanced avatar skeleton */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 animate-pulse flex items-center justify-center overflow-hidden">
                <User className="w-12 h-12 text-gray-400 animate-pulse" />
                {/* Shimmer effect */}
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
              </div>

              {/* Enhanced floating particles */}
              <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s' }}></div>
              <div className="absolute -top-1 -right-3 w-2 h-2 bg-purple-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.7s' }}></div>
              <div className="absolute -bottom-1 -left-3 w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute top-0 right-0 w-1 h-1 bg-yellow-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Enhanced info skeleton */}
            <div className="flex-1 space-y-4 text-center sm:text-left">
             <div className="space-y-3">
                {/* Name skeleton with gradient animation */}
                <div className="h-8 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-500/30 to-transparent animate-[shimmer_1.5s_infinite]"></div>
                </div>
                {/* Email skeleton */}
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 animate-pulse" />
                  <div className="h-4 w-36 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-500/30 to-transparent animate-[shimmer_1.8s_infinite]"></div>
                  </div>
                </div>
              </div>

              {/* Enhanced bio skeleton */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-500/30 to-transparent animate-[shimmer_2.2s_infinite]"></div>
                </div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-4/5 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-500/30 to-transparent animate-[shimmer_2.5s_infinite]"></div>
                </div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-3/5 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-500/30 to-transparent animate-[shimmer_2.8s_infinite]"></div>
                </div>
              </div>

              {/* Enhanced button skeleton */}
              <div className="h-12 w-52 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 dark:from-blue-800 dark:via-blue-700 dark:to-blue-800 rounded-lg animate-pulse flex items-center justify-center gap-2 relative overflow-hidden">
                <Edit3 className="w-4 h-4 text-blue-400 animate-pulse" />
                <div className="h-4 w-32 bg-blue-300/50 dark:bg-blue-600/50 rounded animate-pulse"></div>
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_infinite]"></div>
              </div>
            </div>
          </div>

          {/* Enhanced stats skeleton */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            {[0, 1].map((index) => (
              <div key={index} className="text-center p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl backdrop-blur-sm space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calendar className={`w-4 h-4 ${index === 0 ? 'text-blue-400' : 'text-green-400'} animate-pulse`} />
                  <div className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse mx-auto"></div>
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2.5s_infinite]" style={{ animationDelay: `${index * 0.5}s` }}></div>
              </div>
            ))}
          </div>

          {/* Enhanced loading indicator */}
          <div className="absolute top-4 right-4">
            <div className="relative">
              <WaveLoader color="blue" />
              <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Ambient light effect */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 via-purple-400/5 to-transparent rounded-full animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/10 via-purple-400/5 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`max-w-2xl mx-auto overflow-hidden bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-blue-900/20 border-0 shadow-2xl backdrop-blur-sm transition-all duration-700 transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <CardContent className="p-8 relative">
        {/* Ambient background effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 via-purple-400/3 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/5 via-purple-400/3 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Header с аватаром и основной информацией */}
        <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-8">
          {/* Enhanced Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="User avatar"
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400 transition-all duration-300 group-hover:text-gray-500 group-hover:scale-110" />
              )}
            </div>

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-300 -z-10 blur-xl"></div>
          </div>

          {/* Enhanced main info */}
          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 group">
                <h1 
                  onClick={copyUsername}
                  className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent mb-2 transition-all duration-300 hover:scale-105 transform-gpu cursor-pointer select-all"
                  title={t('clickToCopy')}
                >
                  {user.username}
                </h1>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-2">
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy 
                      className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer" 
                      onClick={copyUsername}
                      aria-label={t('copyUsername')}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-400 group">
                <Mail className="w-4 h-4 transition-colors duration-300 group-hover:text-blue-500" />
                <span className="text-sm transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">{user.email}</span>
              </div>
            </div>

            {/* Enhanced bio */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-lg group">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                {user.bio || (
                  <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 italic">
                    <Sparkles className="w-4 h-4" />
                    {t('addProfileDescription')}
                  </span>
                )}
              </p>
            </div>

            {/* Enhanced edit button */}
            <Button 
              onClick={() => setOpenEdit(true)}
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 group relative overflow-hidden cursor-pointer"
              size="lg"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-300/0 to-blue-400/0 group-hover:from-blue-400/20 group-hover:via-blue-300/30 group-hover:to-blue-400/20 transition-all duration-300"></div>
              <Edit3 className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative z-10">{t('editProfile')}</span>
            </Button>
          </div>
        </div>

        {/* Enhanced statistics */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div 
            className="text-center p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-lg hover:-translate-y-1 group"
            onMouseEnter={() => setHoveredStat('created')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className={`w-4 h-4 transition-all duration-300 ${
                hoveredStat === 'created' 
                  ? 'text-blue-600 scale-110 rotate-12' 
                  : 'text-blue-600'
              }`} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                {t('registration')}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {user.created_at
                ? format(new Date(user.created_at), "dd MMM yyyy")
                : "н/д"}
            </p>
            {hoveredStat === 'created' && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-600/10 rounded-xl animate-pulse"></div>
            )}
          </div>

          <div 
            className="text-center p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-lg hover:-translate-y-1 group relative"
            onMouseEnter={() => setHoveredStat('updated')}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className={`w-4 h-4 transition-all duration-300 ${
                hoveredStat === 'updated' 
                  ? 'text-green-600 scale-110 rotate-12' 
                  : 'text-green-600'
              }`} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                {t('lastUpdate')}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-all duration-300 group-hover:text-green-600 dark:group-hover:text-green-400">
              {user.updated_at
                ? format(new Date(user.updated_at), "dd MMM yyyy")
                : "н/д"}
            </p>
            {hoveredStat === 'updated' && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-green-600/10 rounded-xl animate-pulse"></div>
            )}
          </div>
        </div>

        <CompUserEditDialog open={openEdit} onOpenChange={setOpenEdit} />
      </CardContent>
    </Card>
  );
}