import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import type { ExtendedPainting } from "@/lib/types/paintingTypes";
import type { ReactNode } from "react";
import { useState } from "react";
import { 
  DollarSign, 
  ImageIcon, 
  Sparkles, 
  Calendar,
  Edit3,
  MoreVertical,
  ShoppingCart,
  Lock,
  Tag,
  Globe,
  EyeOff,
  Zap,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { usePaintingListStore } from "@/store/paintingListStore";
import { useTranslation } from "react-i18next";

interface Props {
  painting: ExtendedPainting;
  actionButton?: ReactNode;
  showDate?: boolean;
  showStats?: boolean;
  currentUserId?: string;
  onUpdate?: () => void;
}

type Status = 'for_sale' | 'not_for_sale' | 'sold';

export function CompPaintingCardGridProfile({ 
  painting, 
  actionButton, 
  showDate = true, 
  //showStats = true,
  currentUserId,
  onUpdate 
}: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const updatePainting = usePaintingListStore(s => s.updatePainting);
  const deletePainting = usePaintingListStore(s => s.deletePainting);
  const { t } = useTranslation();

  const paintingStatuses = [
    { id: 'for_sale' as const, label: t('statusForSale'), icon: ShoppingCart, color: 'text-green-600' },
    { id: 'not_for_sale' as const, label: t('statusNotForSale'), icon: Lock, color: 'text-blue-600' },
    { id: 'sold' as const, label: t('statusSold'), icon: Tag, color: 'text-gray-600' },
  ];

  const formattedPrice = painting.price != null 
    ? `${painting.price.toFixed(2)} $` 
    : t('priceNotSpecified');

  const createdAt = painting.created_at
    ? format(new Date(painting.created_at), "dd MMM yyyy")
    : "";

  const isOwner = currentUserId && painting.created_by === currentUserId;

  const handleStatusChange = async (newStatus: Status) => {
    if (!isOwner) return;
    
    setLoading(true);
    try {
      await updatePainting(painting.id, { status: newStatus });
      const statusLabel = paintingStatuses.find(s => s.id === newStatus)?.label;
      toast.success(t('statusUpdated'), { 
        description: t('statusChangedTo', { status: statusLabel })
      });
      onUpdate?.();
    } catch (error) {
      toast.error(t('updateError'), { description: t('failedToChangeStatus') });
    } finally {
      setLoading(false);
    }
  };

  const handlePublicToggle = async () => {
    if (!isOwner) return;
    
    setLoading(true);
    try {
      await updatePainting(painting.id, { is_public: !painting.is_public });
      toast.success(t('settingsUpdated'), { 
        description: painting.is_public ? t('paintingHiddenFromPublic') : t('paintingNowPublic')
      });
      onUpdate?.();
    } catch (error) {
      toast.error(t('updateError'), { description: t('failedToChangePrivacySettings') });
    } finally {
      setLoading(false);
    }
  };

  const handleActiveToggle = async () => {
    if (!isOwner) return;
    
    setLoading(true);
    try {
      await updatePainting(painting.id, { is_active: !painting.is_active });
      toast.success(t('settingsUpdated'), { 
        description: painting.is_active ? t('paintingDeactivated') : t('paintingActivated')
      });
      onUpdate?.();
    } catch (error) {
      toast.error(t('updateError'), { description: t('failedToChangeActiveStatus') });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    
    if (!confirm(t('confirmDeletePainting'))) {
      return;
    }
    
    setLoading(true);
    try {
      await deletePainting(painting.id);
      toast.success(t('paintingDeleted'), { description: t('paintingDeletedFromGallery') });
      onUpdate?.();
    } catch (error) {
      toast.error(t('deleteError'), { description: t('failedToDeletePainting') });
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = paintingStatuses.find(s => s.id === painting.status);

  return (
    <Card className="group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 relative">
      {/* Options menu - показываем только для владельцев */}
      {isOwner && (
        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="icon"
                variant="ghost"
                disabled={loading}
                className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform duration-200 h-8 w-8"
              >
                <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                {t('managePainting')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Status change */}
              <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {t('saleStatus')}
              </DropdownMenuLabel>
              {paintingStatuses.map((status) => (
                <DropdownMenuItem 
                  key={status.id}
                  onClick={() => handleStatusChange(status.id)}
                  disabled={loading || painting.status === status.id}
                  className={`flex items-center gap-2 ${
                    painting.status === status.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <status.icon className={`w-4 h-4 ${status.color}`} />
                  <span>{status.label}</span>
                  {painting.status === status.id && (
                    <Sparkles className="w-3 h-3 ml-auto text-blue-500" />
                  )}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              {/* Public/Private toggle */}
              <DropdownMenuItem 
                onClick={handlePublicToggle}
                disabled={loading}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {painting.is_public ? (
                    <Globe className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-500" />
                  )}
                  <span>{painting.is_public ? t('public') : t('private')}</span>
                </div>
                <Switch 
                  checked={painting.is_public} 
                  disabled={loading}
                  className="pointer-events-none"
                />
              </DropdownMenuItem>
              
              {/* Active toggle */}
              <DropdownMenuItem 
                onClick={handleActiveToggle}
                disabled={loading}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {painting.is_active ? (
                    <Zap className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  )}
                  <span>{painting.is_active ? t('active') : t('inactive')}</span>
                </div>
                <Switch 
                  checked={painting.is_active} 
                  disabled={loading}
                  className="pointer-events-none"
                />
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Delete */}
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('delete')} {t('paintingTitle').toLowerCase()}</span>
                <AlertTriangle className="w-3 h-3 ml-auto" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Image container */}
      <div className="relative overflow-hidden">
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="w-full h-48 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse flex items-center justify-center">
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
          className={`w-full h-48 object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Quick edit indicator - показываем только для владельцев */}
        {isOwner && (
          <div className="cursor-pointer absolute bottom-3 left-3 flex items-center gap-1 bg-blue-600/80 text-white px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
            <Edit3 className="w-3 h-3" />
            <span>{t('edit')}</span>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('updating')}</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Title */}
        <CardTitle>
          <h3 className="text-lg font-bold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {painting.title}
          </h3>
        </CardTitle>

        {/* Description */}
        <div className="h-10"> {/* Фиксированная высота для описания */}
          {painting.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {painting.description.length > 80 
                ? `${painting.description.substring(0, 80)}...` 
                : painting.description}
            </p>
          )}
        </div>

        {/* Price section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {formattedPrice}
            </span>
          </div>
          
          {/* Action button */}
          <div className="flex items-center gap-2">
            {actionButton}
          </div>
        </div>

        {/* Stats and date */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">          
          {showDate && createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{createdAt}</span>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center pt-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            currentStatus?.id === 'for_sale' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : currentStatus?.id === 'sold'
              ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            {currentStatus && (
              <>
                <currentStatus.icon className={`w-3 h-3 ${currentStatus.color}`} />
                <span className={`text-xs font-medium ${
                  currentStatus.id === 'for_sale' 
                    ? 'text-green-700 dark:text-green-300'
                    : currentStatus.id === 'sold'
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-blue-700 dark:text-blue-300'
                }`}>
                  {currentStatus.label}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Privacy indicators - показываем только для владельцев */}
        {isOwner && (
          <div className="flex items-center justify-center gap-2 pt-1">
            {!painting.is_public && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full">
                <Lock className="w-2 h-2 text-orange-600 dark:text-orange-400" />
                <span className="text-xs text-orange-700 dark:text-orange-300">{t('private')}</span>
              </div>
            )}
            {!painting.is_active && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full">
                <EyeOff className="w-2 h-2 text-red-600 dark:text-red-400" />
                <span className="text-xs text-red-700 dark:text-red-300">{t('inactive')}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 via-purple-400/0 to-green-400/0 group-hover:from-blue-400/5 group-hover:via-purple-400/5 group-hover:to-green-400/5 transition-all duration-300 pointer-events-none"></div>
    </Card>
  );
}