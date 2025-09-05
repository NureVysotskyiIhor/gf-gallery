// src/components/compOwnerGrid.tsx
import { useEffect, useState } from "react";
import { usePaintingListStore } from "@/store/paintingListStore";
import { Pencil, Plus, Palette, Filter, Sparkles, Eye, EyeOff, ShoppingCart, Lock, Tag } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompPaintingCardGridProfile } from "./compPaintingCardGridProfile";
import { CompPaintingEditDialog } from "./compPaintingEditDialog";
import { useNavigate } from "@tanstack/react-router";
import { FloatingLoadingIndicator, LoadingParticles } from "@/components/functions/loading";
import { useTranslation } from "react-i18next";

type FilterType = 'all' | 'active' | 'for_sale' | 'not_for_sale' | 'sold' | 'public' | 'private';

export function CompOwnerGrid({ userId }: { userId: string }) {
  const { t } = useTranslation();
  
  const paintingsByOwner = usePaintingListStore((s) => s.paintingsByOwner);
  const loadingOwner = usePaintingListStore((s) => s.loadingOwner);
  const fetchPaintingsByOwner = usePaintingListStore((s) => s.fetchPaintingsByOwner);
  const navigate = useNavigate();

  // Состояние для активного фильтра
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Создаем filterOptions с локализацией внутри компонента
  const filterOptions = [
    { 
      id: 'all' as FilterType, 
      label: t('allPaintings'), 
      icon: Sparkles, 
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50' 
    },
    { 
      id: 'active' as FilterType, 
      label: t('activePaintings'), 
      icon: Eye, 
      color: 'hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-900/20' 
    },
    { 
      id: 'for_sale' as FilterType, 
      label: t('statusForSale'), 
      icon: ShoppingCart, 
      color: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-900/20' 
    },
    { 
      id: 'not_for_sale' as FilterType, 
      label: t('statusNotForSale'), 
      icon: Lock, 
      color: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-900/20' 
    },
    { 
      id: 'sold' as FilterType, 
      label: t('statusSold'), 
      icon: Tag, 
      color: 'hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 dark:hover:bg-gray-800/50' 
    },
    { 
      id: 'public' as FilterType, 
      label: t('publicPaintings'), 
      icon: Eye, 
      color: 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 dark:hover:bg-purple-900/20' 
    },
    { 
      id: 'private' as FilterType, 
      label: t('privatePaintings'), 
      icon: EyeOff, 
      color: 'hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 dark:hover:bg-orange-900/20' 
    }
  ];

  useEffect(() => {
    fetchPaintingsByOwner(userId);
  }, [userId, fetchPaintingsByOwner]);

  // Функция для фильтрации картин
  const getFilteredPaintings = () => {
    switch (activeFilter) {
      case 'all':
        return paintingsByOwner;
      case 'active':
        return paintingsByOwner.filter(p => p.is_active);
      case 'for_sale':
        return paintingsByOwner.filter(p => p.status === 'for_sale');
      case 'not_for_sale':
        return paintingsByOwner.filter(p => p.status === 'not_for_sale');
      case 'sold':
        return paintingsByOwner.filter(p => p.status === 'sold');
      case 'public':
        return paintingsByOwner.filter(p => p.is_public);
      case 'private':
        return paintingsByOwner.filter(p => !p.is_public);
      default:
        return paintingsByOwner;
    }
  };

  const filteredPaintings = getFilteredPaintings();

  // Функция для получения счетчика по типу фильтра
  const getFilterCount = (filterType: FilterType): number => {
    switch (filterType) {
      case 'all':
        return paintingsByOwner.length;
      case 'active':
        return paintingsByOwner.filter(p => p.is_active).length;
      case 'for_sale':
        return paintingsByOwner.filter(p => p.status === 'for_sale').length;
      case 'not_for_sale':
        return paintingsByOwner.filter(p => p.status === 'not_for_sale').length;
      case 'sold':
        return paintingsByOwner.filter(p => p.status === 'sold').length;
      case 'public':
        return paintingsByOwner.filter(p => p.is_public).length;
      case 'private':
        return paintingsByOwner.filter(p => !p.is_public).length;
      default:
        return 0;
    }
  };

  if (loadingOwner) {
    return (
      <div className="space-y-8">
        {/* Заголовок секции - skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-xl animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 w-40 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-lg animate-pulse"></div>
            <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Фильтры - skeleton */}
        <div className="flex gap-3 p-6 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-8 w-16 bg-blue-200 dark:bg-blue-800 rounded-lg animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>

        {/* Скелетон сетки с анимированными карточками */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full"></div>
                {/* Floating palette animation */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Palette className="w-8 h-8 text-blue-300 animate-pulse" />
                </div>
                {/* Paint drops animation */}
                <div className="absolute top-6 left-6 w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="absolute bottom-8 right-8 w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-12 right-12 w-1 h-1 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}

          {/* Специальная карточка "Добавить" в loading состоянии */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl shadow-lg overflow-hidden border-2 border-dashed border-indigo-200 dark:border-indigo-700 animate-pulse">
            <div className="w-full h-48 flex flex-col items-center justify-center relative">
              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-full animate-pulse">
                <Plus className="w-8 h-8 text-indigo-300 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div className="absolute top-4 left-4 w-2 h-2 bg-indigo-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-4 right-4 w-3 h-3 bg-purple-200 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
            <div className="p-4 text-center space-y-2">
              <div className="h-4 bg-indigo-200 dark:bg-indigo-800 rounded mx-auto w-24 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-32 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Floating loading indicator */}
        <FloatingLoadingIndicator 
          icon={Palette} 
          text={t('loadingGallery')}
          color="blue" 
        />

        {/* Ambient loading particles */}
        <LoadingParticles />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Заголовок секции */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
          <Palette className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('myPaintings')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('artworksInGallery', { count: paintingsByOwner.length })}
            {activeFilter !== 'all' && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                {t('byFilter', { 
                  count: filteredPaintings.length, 
                  filterName: filterOptions.find(f => f.id === activeFilter)?.label 
                })}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 p-6 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-2 mr-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('filters')}:</span>
        </div>
        
        {filterOptions.map((filter) => {
          const count = getFilterCount(filter.id);
          const isActive = activeFilter === filter.id;
          const IconComponent = filter.icon;
          
          return (
            <Button 
              key={filter.id}
              size="sm" 
              variant={isActive ? "default" : "outline"}
              onClick={() => setActiveFilter(filter.id)}
              className={`
                relative transition-all duration-200 
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 border-0 shadow-md' 
                  : `variant-outline ${filter.color}`
                }
                ${count === 0 && filter.id !== 'all' ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={count === 0 && filter.id !== 'all'}
            >
              <IconComponent className="w-3 h-3 mr-1" />
              <span>{filter.label}</span>
              {count > 0 && (
                <span className={`
                  ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium
                  ${isActive 
                    ? 'bg-blue-200 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200' 
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }
                `}>
                  {count}
                </span>
              )}
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              )}
            </Button>
          );
        })}
      </div>

      {/* Сетка картин */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPaintings.map((p) => (
          <CompPaintingEditDialog
            key={p.id}
            painting={p}
            onFinish={() => fetchPaintingsByOwner(userId)}
          >
            <CompPaintingCardGridProfile
              painting={p}
              currentUserId={userId}
              onUpdate={() => fetchPaintingsByOwner(userId)}
              actionButton={
                <DialogTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="secondary"
                    className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              }
            />
          </CompPaintingEditDialog>
        ))}

        {/* Кнопка "Добавить картину" */}
        <Card
          onClick={() => navigate({ to: "/route-painting-create" })}
          className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 border-2 border-dashed border-indigo-300 dark:border-indigo-600"
        >
          <div className="w-full h-48 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-100/50 dark:to-indigo-900/20"></div>
            
            {/* Icon with animation */}
            <div className="relative z-10 p-4 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Plus className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:rotate-90 transition-transform duration-300" />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-indigo-300 rounded-full opacity-50"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 bg-purple-300 rounded-full opacity-30"></div>
            <div className="absolute top-1/2 right-8 w-1 h-1 bg-indigo-400 rounded-full opacity-40"></div>
          </div>
          
          <CardContent className="p-4 text-center">
            <p className="text-base font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
              {t('addPainting')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('shareYourCreativity')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Пустые состояния */}
      {paintingsByOwner.length === 0 ? (
        <div className="text-center py-16">
          <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Palette className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {t('createYourFirstPainting')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('shareYourCreativityWithWorld')}
          </p>
          <Button 
            onClick={() => navigate({ to: "/route-painting-create" })}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addPainting')}
          </Button>
        </div>
      ) : filteredPaintings.length === 0 ? (
        // Пустое состояние для отфильтрованного списка
        <div className="text-center py-16">
          <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {t('paintingsNotFound')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('noArtworksByFilter', { 
              filterName: filterOptions.find(f => f.id === activeFilter)?.label 
            })}
          </p>
          <Button 
            onClick={() => setActiveFilter('all')}
            variant="outline"
            className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-900/20"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t('showAllPaintings')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}