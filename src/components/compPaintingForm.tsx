//src\components\compPaintingForm.tsx
import { useEffect, useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { usePaintingDetailStore } from "@/store/paintingDetailStore"
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  Share2, 
  User, 
  Palette, 
  Eye, 
  Sparkles, 
  ArrowLeft,
  DollarSign,
  Calendar,
  ImageIcon,
  ExternalLink,
  Shield,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  MessageCircle,
  ZoomIn
} from 'lucide-react'
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

// Компонент для анимированных частиц
function PaintingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length:20 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          <Sparkles 
            className="w-3 h-3 text-amber-400 animate-pulse" 
            style={{ 
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Компонент скелетона для изображения
function ImageSkeleton() {
  return (
    <div className="relative rounded-2xl w-full h-[500px] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <ImageIcon className="w-20 h-20 text-gray-400 dark:text-gray-600 animate-pulse" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-gray-600/20 animate-shimmer"></div>
    </div>
  );
}

// Компонент скелетона для карточки с информацией
function InfoCardSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 dark:from-gray-900 dark:via-amber-900/10 dark:to-orange-900/10 border-0 shadow-xl">
        <CardHeader>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 animate-pulse mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Компонент полного скелетона
function PaintingDetailSkeleton() {
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ImageSkeleton />
        </div>
        <div>
          <InfoCardSkeleton />
        </div>
      </div>
    </div>
  );
}

// Компонент состояния "не найдено"
function PaintingNotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 text-center">
      <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-3xl p-12 border border-red-200 dark:border-red-800">
        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ImageIcon className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('paintingsNotFound')}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {t('dialogDeletedNoAccess')}
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm"
          size="lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('backToProfile')}
        </Button>
      </div>
    </div>
  );
}

// Компонент для статуса картины
function StatusBadge({ status, isActive, t }: { status: string, isActive: boolean, t: any }) {
  if (!isActive) {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        <XCircle className="w-3 h-3 mr-1" />
        {t('dialogInactive')}
      </Badge>
    );
  }

  switch (status) {
    case 'for_sale':
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
          <ShoppingCart className="w-3 h-3 mr-1" />
          {t('statusForSale')}
        </Badge>
      );
    case 'sold':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          {t('statusSold')}
        </Badge>
      );
    case 'not_for_sale':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
          <Eye className="w-3 h-3 mr-1" />
          {t('statusNotForSale')}
        </Badge>
      );
    default:
      return null;
  }
}

export function CompPaintingForm({ paintingId }: { paintingId: number }) {
  const { t } = useTranslation();
  const { user } = useUserStore()
  const [imageLoading, setImageLoading] = useState(true)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [isImageExpanded, setIsImageExpanded] = useState(false)

  const {
    painting,
    loading,
    isFavorite,
    fetchPainting,
    fetchFavorite,
    toggleFavorite,
  } = usePaintingDetailStore()

  useEffect(() => {
    fetchPainting(paintingId)
  }, [paintingId, fetchPainting])

  useEffect(() => {
    if (user && painting) {
      fetchFavorite(user.id, paintingId)
    }
  }, [user, painting, paintingId, fetchFavorite])

  if (loading) return <PaintingDetailSkeleton />
  if (!painting) return <PaintingNotFound />

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error(t('authRequired'), { 
        description: t('loginToAddFavorites')
      })
      return
    }
    
    setFavoriteLoading(true)
    try {
      await toggleFavorite(user.id, paintingId)
      toast.success(
        isFavorite ? t('removedFromFavorites') : t('addedToFavorites'),
        { 
          description: isFavorite 
            ? t('removedFromFavorites') 
            : t('addedToFavorites')
        }
      )
    } catch (error) {
      toast.error(t('error'), { description: t('failedToChangeFavoriteStatus') })
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleShare = async () => {
    setShareLoading(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: painting.title,
          text: painting.description || `${t('viewDetails')}: ${painting.title}`,
          url: window.location.href,
        })
        toast.success(t('messageSent'), { description: t('messageSent') })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(t('usernameCopied'), { description: t('usernameCopied') })
      }
    } catch (error) {
      console.error('Ошибка при попытке поделиться:', error)
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(t('usernameCopied'), { description: t('usernameCopied') })
      } catch (clipboardError) {
        toast.error(t('error'), { description: t('errorOccurred') })
      }
    } finally {
      setShareLoading(false)
    }
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return t('priceNotSpecified')
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOwner = user?.id === painting.created_by

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-amber-900/10 relative">
      {/* Background particles */}
      <PaintingParticles />
      
      <div className="max-w-7xl mx-auto py-8 px-4 relative z-10">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('backToProfile')}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Image Section - теперь занимает 2/3 ширины */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-2xl overflow-hidden">
              <div className="relative group">
                {imageLoading && (
                  <div className="absolute inset-0 z-10">
                    <ImageSkeleton />
                  </div>
                )}
                <img
                  src={painting.image_url ?? undefined}
                  alt={painting.title}
                  className={`w-full h-[500px] lg:h-[600px] object-cover transition-all duration-500 group-hover:scale-[1.02] ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
                
                {/* Image controls overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setIsImageExpanded(true)}
                      className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-900 transform scale-0 group-hover:scale-100 transition-transform duration-300"
                      size="lg"
                    >
                      <ZoomIn className="w-5 h-5 mr-2" />
                      {t('view')}
                    </Button>
                  </div>
                </div>

                {/* Status badge overlay */}
                <div className="absolute top-4 left-4">
                  <StatusBadge status={painting.status} isActive={painting.is_active} t={t} />
                </div>

                {/* Favorite button overlay */}
                <Button
                  variant={isFavorite ? 'destructive' : 'outline'}
                  onClick={handleFavoriteClick}
                  disabled={favoriteLoading}
                  className={`absolute top-4 right-4 transition-all duration-300 transform hover:scale-110 ${
                    isFavorite 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                      : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                  size="lg"
                >
                  {favoriteLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isFavorite ? (
                    <Heart className="w-5 h-5 fill-current" />
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Main Info Card */}
            <Card className="bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 dark:from-gray-900 dark:via-amber-900/10 dark:to-orange-900/10 border-0 shadow-2xl backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                    {painting.title}
                  </h1>
                  <div className="flex items-center gap-3 text-2xl">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                    <span className={`font-bold ${
                      painting.price !== null 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatPrice(painting.price)}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Description */}
                {painting.description && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-600" />
                      {t('description')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 break-words whitespace-pre-wrap word-wrap">
                      {painting.description}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Details */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    {t('information')}
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Public status */}
                    <div className="flex items-center justify-between py-2 px-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {t('visible')}
                      </span>
                      <Badge variant={painting.is_public ? "default" : "secondary"}>
                        {painting.is_public ? t('publicPainting') : t('privatePaintings')}
                      </Badge>
                    </div>

                    {/* Creation date */}
                    <div className="py-2 px-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        {t('created')}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(painting.created_at)}
                      </div>
                    </div>

                    {/* Last update */}
                    {painting.updated_at && (
                      <div className="flex items-center justify-between py-2 px-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {t('lastUpdate')}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(painting.updated_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 border-0 shadow-2xl backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Author button */}
                  {painting.created_by && (
                    <Link
                      to="/user-page-paint-author"
                      search={{ userId: painting.created_by }}
                      className="block"
                    >
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                        size="lg"
                      >
                        <User className="w-5 h-5 mr-2" />
                        {painting.users?.username ? `${t('profile')} ${painting.users.username}` : t('profile')}
                        <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                      </Button>
                    </Link>
                  )}

                  {/* Contact author - если картина продается */}
                  {!isOwner && painting.status === 'for_sale' && painting.is_active && (
                    <Link to="/route-conversation-new" className="block">
                    <Button
                      variant="outline"
                      className="w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                      size="lg"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {t('startConversation')}
                    </Button>
                    </Link>
                  )}
                  
                  {/* Share button */}
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    disabled={shareLoading}
                    className="w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    size="lg"
                  >
                    {shareLoading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Share2 className="w-5 h-5 mr-2" />
                    )}
                    {t('actions')}
                  </Button>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image modal */}
      {isImageExpanded && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img
              src={painting.image_url ?? undefined}
              alt={painting.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              onClick={() => setIsImageExpanded(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              size="sm"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}