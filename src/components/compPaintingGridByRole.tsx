// src/components/CompPaintingGridByRole.tsx
import { CompFavoritesGrid } from "./compFavoritesGrid";
import { CompOwnerGrid } from "./compOwnerGrid";
import { Heart, Palette, User, Crown, Sparkles } from "lucide-react";
import type { ExtendedUser } from "@/lib/types/userTypes";
import { useTranslation } from "react-i18next";

export function CompPaintingGridByRole({ user }: { user: ExtendedUser }) {
  const { t } = useTranslation();

  // Компонент для отображения иконки и описания роли
  const RoleIndicator = ({ role }: { role: number | null }) => {
    if (role === 1) {
      return (
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-lg">
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              {t('collector')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('collectorDescription')}
            </p>
          </div>
        </div>
      );
    } else if (role === 2) {
      return (
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
            <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {t('artist')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('artistDescription')}
            </p>
          </div>
        </div>
      );
    }
    return null; // если роль неизвестна или null
  };

  return (
    <div className="space-y-8">
      {/* Заголовок по роли */}
      <div className="bg-gradient-to-r from-white/60 via-gray-50/80 to-white/60 dark:from-gray-900/60 dark:via-gray-800/80 dark:to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
        <RoleIndicator role={user.role_id} />

        {/* Разделитель */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <User className="w-3 h-3" />
            <span>{user.username ?? t('noName')}</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
        </div>
      </div>

      {/* Контент по роли */}
      <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
        {user.role_id === 1 ? (
          <CompFavoritesGrid userId={user.id} />
        ) : (
          <CompOwnerGrid userId={user.id} />
        )}
      </div>
    </div>
  );
}