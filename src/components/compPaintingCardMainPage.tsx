//src\components\compPaintingCardMainPage.tsx
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { ExtendedPainting } from "@/lib/types/paintingTypes";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Heart, 
  Eye, 
  Calendar, 
  DollarSign, 
  User, 
  ImageIcon
} from "lucide-react";
import { usePaintingListStore } from "@/store/paintingListStore";
import { useUserStore } from "@/store/userStore";
import { toast } from 'sonner'

interface PaintingCardProps {
  painting: ExtendedPainting;
  priority?: boolean;
  showAuthor?: boolean;
}

export function CompPaintingCardMainPage({ 
  painting, 
  priority = false, 
  showAuthor = true 
}: PaintingCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { user } = useUserStore();
  const { favoritePaintings, toggleFavorite, fetchFavoritePaintings } = usePaintingListStore();
  const { t } = useTranslation();

  const formattedPrice =
    painting.price != null
      ? `${painting.price.toFixed(2)} $`
      : t('priceNotSpecified');

  const createdAt = painting.created_at
    ? format(new Date(painting.created_at), "dd MMM yyyy")
    : "";

  // Check if painting is in favorites when component mounts or favorites change
  useEffect(() => {
    if (user?.id) {
      const isInFavorites = favoritePaintings.some(fav => fav.id === painting.id);
      setIsFavorite(isInFavorites);
    }
  }, [user?.id, favoritePaintings, painting.id]);

  // Load favorites when user is available
  useEffect(() => {
    if (user?.id && favoritePaintings.length === 0) {
      fetchFavoritePaintings(user.id);
    }
  }, [user?.id, fetchFavoritePaintings, favoritePaintings.length]);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error(t('authRequired'), { 
        description: t('loginToAddFavorites')
      })
      return
    }

    setIsFavoriteLoading(true);
    try {
      await toggleFavorite(user.id, painting.id);
      const newIsFavorite = !isFavorite;
      setIsFavorite(newIsFavorite);
      
      // Show toast notification
      if (newIsFavorite) {
        toast.success(t('addedToFavorites'), {
          description: `"${painting.title}" ${t('addedToFavorites')}`
        });
      } else {
        toast.info(t('removedFromFavorites'), {
          description: `"${painting.title}" ${t('removedFromFavorites')}`
        });
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса избранного:', error);
      toast.error(t('error'), {
        description: t('failedToChangeFavoriteStatus')
      });
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  return (
    <Card className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 relative">

      {/* Image container */}
      <div className="relative overflow-hidden">
        <Link 
          to="/route-painting" 
          search={{ paintingId: painting.id }} 
          className="block relative"
        >
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="w-full h-56 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 opacity-60">
                <ImageIcon className="w-8 h-8 text-gray-400 animate-bounce" />
                <div className="w-16 h-2 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
              {/* Shimmer effect */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-500/20 to-transparent animate-[shimmer_2s_infinite]"></div>
            </div>
          )}

          {/* Actual image */}
          <img
            src={painting.image_url ?? "/placeholder.png"}
            alt={painting.title}
            className={`w-full h-56 object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            loading={priority ? "eager" : "lazy"}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* View indicator */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
            <Eye className="w-3 h-3" />
            <span>{t('viewDetails')}</span>
          </div>
        </Link>
      </div>

      {/* Content */}
      <CardContent className="p-5 space-y-3">
        {/* Title */}
          <CardTitle>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors duration-200">
                {painting.title}
              </h3>
              {/* Like button */}
              <button
                onClick={handleLikeClick}
                disabled={isFavoriteLoading}
                className={`w-7 h-7 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                  !user?.id ? 'opacity-50 cursor-not-allowed' : ''
                } ${isFavoriteLoading ? 'animate-pulse' : ''}`}
              >
                <Heart 
                  className={`w-6 h-6 transition-all duration-200 ${
                    isFavorite 
                      ? 'text-red-500 fill-current scale-110' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-red-500 hover:scale-110'
                  }`} 
                />
              </button>
            </div>
          </CardTitle>

        {/* Description */}
        {painting.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {painting.description}
          </p>
        )}

        {/* Author info */}
        {showAuthor && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="truncate">
              {painting.users?.username ?? t('anonymous')}
            </span>
          </div>
        )}

        {/* Price and date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {formattedPrice}
            </span>
          </div>
          
          {createdAt && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{createdAt}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-blue-400/5 group-hover:via-purple-400/5 group-hover:to-pink-400/5 transition-all duration-300 pointer-events-none"></div>
      
      {/* Favorite indicator overlay */}
      {isFavorite && (
        <div className="absolute top-3 right-3 w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center backdrop-blur-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">
          <Heart className="w-4 h-4 text-white fill-current" />
        </div>
      )}
    </Card>
  );
}