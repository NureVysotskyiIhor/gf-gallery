// src/components/compFavoritesGrid.tsx
import { useEffect } from "react";
import { usePaintingListStore } from "@/store/paintingListStore";
import type { PaintingStatusFilter } from "@/store/paintingListStore";
import { HeartMinus, Heart, Filter, Sparkles, ShoppingCart, Palette, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompPaintingCardGridProfile } from "./compPaintingCardGridProfile";
import { FloatingLoadingIndicator, LoadingParticles } from "@/components/functions/loading";
import { useTranslation } from "react-i18next";

export function CompFavoritesGrid({ userId }: { userId: string }) {
  const { t } = useTranslation();
  
  const {
    filteredFavoritePaintings,
    loadingFavorites,
    favoriteStatusFilter,
    fetchFavoritePaintings,
    setFavoriteStatusFilter,
    toggleFavorite,
  } = usePaintingListStore();

  useEffect(() => {
    fetchFavoritePaintings(userId);
  }, [userId, fetchFavoritePaintings]);

  const handleFilterChange = (filter: PaintingStatusFilter) => {
    setFavoriteStatusFilter(filter);
  };

  // Подсчет количества картин по статусам
  const { favoritePaintings } = usePaintingListStore();
  const counts = {
    all: favoritePaintings.length,
    for_sale: favoritePaintings.filter(p => p.status === 'for_sale').length,
    not_for_sale: favoritePaintings.filter(p => p.status === 'not_for_sale').length,
    sold: favoritePaintings.filter(p => p.status === 'sold').length,
  };

  if (loadingFavorites) {
    return (
      <div className="space-y-8">
        {/* Заголовок секции - skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-rose-200 dark:from-pink-800 dark:to-rose-800 rounded-xl animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gradient-to-r from-pink-200 to-rose-200 dark:from-pink-800 dark:to-rose-800 rounded-lg animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Фильтры - skeleton */}
        <div className="flex gap-3 p-6 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-8 w-20 bg-pink-200 dark:bg-pink-800 rounded-lg animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>

        {/* Скелетон сетки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100 dark:from-pink-900/30 dark:via-rose-900/30 dark:to-purple-900/30 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full"></div>
                {/* Floating hearts animation */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Heart className="w-8 h-8 text-pink-300 animate-pulse" />
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating loading indicator */}
        <FloatingLoadingIndicator 
          icon={Heart} 
          text={t('loadingFavorites')}
          color="pink" 
        />

        {/* Ambient particles */}
        <LoadingParticles />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Заголовок секции */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            {t('favoritePaintings')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('ofArtworks', { count: counts.all })} • {filteredFavoritePaintings.length} {t('shown', { count: filteredFavoritePaintings.length })}
          </p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 p-6 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-2 mr-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('filters')}:</span>
        </div>
        
        <Button 
          size="sm" 
          onClick={() => handleFilterChange('all')}
          className={`${
            favoriteStatusFilter === 'all' 
              ? 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-900/50' 
              : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          } border-0 shadow-md transition-all duration-200`}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {t('all')} ({counts.all})
        </Button>

        <Button 
          size="sm" 
          onClick={() => handleFilterChange('for_sale')}
          className={`${
            favoriteStatusFilter === 'for_sale' 
              ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50' 
              : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-green-900/20'
          } border-0 shadow-md transition-all duration-200`}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          {t('statusForSale')} ({counts.for_sale})
        </Button>

        <Button 
          size="sm" 
          onClick={() => handleFilterChange('not_for_sale')}
          className={`${
            favoriteStatusFilter === 'not_for_sale' 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50' 
              : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900/20'
          } border-0 shadow-md transition-all duration-200`}
        >
          <Palette className="w-3 h-3 mr-1" />
          {t('statusNotForSale')} ({counts.not_for_sale})
        </Button>

        <Button 
          size="sm" 
          onClick={() => handleFilterChange('sold')}
          className={`${
            favoriteStatusFilter === 'sold' 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500' 
              : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          } border-0 shadow-md transition-all duration-200`}
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          {t('statusSold')} ({counts.sold})
        </Button>
      </div>

      {/* Сетка картин */}
      {filteredFavoritePaintings.length === 0 ? (
        <div className="text-center py-16">
          <div className="p-6 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Heart className="w-8 h-8 text-pink-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {favoriteStatusFilter === 'all' 
              ? t('noFavoritesYet')
              : t('noFavoritesWithStatus', { status: t(`status${favoriteStatusFilter.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}`) })
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {favoriteStatusFilter === 'all' 
              ? t('addFavoritesToSeeHere')
              : t('trySelectingOtherFilter')
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFavoritePaintings.map((p) => (
            <CompPaintingCardGridProfile
              key={p.id}
              painting={p}
              currentUserId={userId}
              onUpdate={() => fetchFavoritePaintings(userId)}
              actionButton={
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => toggleFavorite(userId, p.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <HeartMinus className="w-4 h-4" />
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}