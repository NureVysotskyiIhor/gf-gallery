// src/pages/PageReviews.tsx
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useReviewsStore, type Review, type ReviewImage } from '@/store/reviewsStore';
import {CompReviewForm} from '@/components/compReviewForm';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";
import {
  Star, Search, Filter, X, RefreshCcw, CheckCircle,
  MessageCircle, Camera, TrendingUp,
  Mail, User, Quote, Sparkles,
  ChevronLeft, ChevronRight, Loader2,
  Trash2, MoreVertical, AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Star Rating Component
function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
    </div>
  );
}

// Statistics Card Component
function StatisticsCard() {
  const { statistics, fetchStatistics } = useReviewsStore();
  const { t } = useTranslation();

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  if (!statistics) return null;

  const ratingBars = [
    { stars: 5, count: statistics.five_star_count },
    { stars: 4, count: statistics.four_star_count },
    { stars: 3, count: statistics.three_star_count },
    { stars: 2, count: statistics.two_star_count },
    { stars: 1, count: statistics.one_star_count }
  ];

  const maxCount = Math.max(...ratingBars.map(b => b.count));

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/20 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {statistics.average_rating.toFixed(1)}
          </div>
          <StarRating rating={Math.round(statistics.average_rating)} size="lg" />
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {statistics.total_reviews} {t('reviews')}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {ratingBars.map(({ stars, count }) => (
            <div key={stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stars}
                </span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-col justify-center space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('verified')}</span>
            </div>
            <span className="font-bold text-green-600 dark:text-green-400">
              {statistics.verified_count}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('withPhotos')}</span>
            </div>
            <span className="font-bold text-purple-600 dark:text-purple-400">
              {statistics.with_images_count}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
  const { deleteReview, getCurrentUser, canUserDeleteReview } = useReviewsStore();
  const { t } = useTranslation();
  const [showFullContent, setShowFullContent] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, [getCurrentUser]);

  // const handleReaction = async () => {
  //   if (review.user_reaction === 'helpful') {
  //     await removeReaction(review.id);
  //   } else {
  //     await addReaction(review.id, 'helpful');
  //   }
  // };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReview(review.id);
      toast.success(t('reviewDeletedSuccessfully'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('reviewDeleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = canUserDeleteReview(review, currentUser);
  const truncatedContent = review.content.length > 300 && !showFullContent
    ? review.content.slice(0, 300) + '...'
    : review.content;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {review.author_avatar_url ? (
                <img 
                  src={review.author_avatar_url} 
                  alt={review.author_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                review.author_name.charAt(0).toUpperCase()
              )}
            </div>
            
            {/* Author Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {review.author_name}
                </h3>
                {review.is_verified && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {/* {review.is_featured && (
                  <Award className="w-4 h-4 text-yellow-500" />
                )} */}
              </div>
              {review.author_email && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {review.author_email}
                </p>
              )}
            </div>
          </div>

          {/* Rating and Date */}
          <div className="text-right">
            <StarRating rating={review.rating} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {format(new Date(review.created_at), 'd MMMM yyyy', { locale: ru })}
            </p>
          </div>

          {/* Actions Menu */}
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  disabled={deleting}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400 cursor-pointer"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('deleteReview')}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        {t('deleteReview')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteReviewConfirmation')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-3">
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleting}
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('deleting')}...
                          </>
                        ) : (
                          t('delete')
                        )}
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Title */}
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {review.title}
        </h4>

        {/* Project Info */}
        {review.project_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <Sparkles className="w-4 h-4" />
            <span>{review.project_name}</span>
            {review.project_type && (
              <>
                <span>•</span>
                <span className="capitalize">{review.project_type}</span>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative">
          <Quote className="absolute -top-2 -left-2 w-8 h-8 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed pl-6">
            {truncatedContent}
          </p>
          {review.content.length > 300 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2 hover:underline"
            >
              {showFullContent ? t('collapse') : t('readFull')}
            </button>
          )}
        </div>

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {review.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {review.images.map((image: ReviewImage) => (
              <button
                key={image.id}
                onClick={() => {
                  setSelectedImage(image.image_url);
                  setImageModalOpen(true);
                }}
                className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
              >
                <img
                  src={image.thumbnail_url || image.image_url}
                  alt={image.caption || t('reviewImage')}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Artist Response */}
        {review.response_text && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                {t('artistResponse')}
              </span>
              {review.response_date && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  • {format(new Date(review.response_date), 'd MMM yyyy', { locale: ru })}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {review.response_text}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {/* <button
            onClick={handleReaction}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              review.user_reaction === 'helpful'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${review.user_reaction === 'helpful' ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{t('helpful')}</span>
            {review.helpful_count > 0 && (
              <span className="text-xs">({review.helpful_count})</span>
            )}
          </button> */}
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <img
            src={selectedImage}
            alt={t('review')}
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
}

// Filters Component
function ReviewFilters() {
  const { filters, setFilters, resetFilters } = useReviewsStore();
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filters.search || filters.author_name || filters.author_email || 
    filters.rating !== null || filters.project_type || filters.is_verified !== null ||
    filters.sortBy !== 'newest';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
      {/* Main Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={t('searchReviews')}
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-12 h-12 bg-gray-50 dark:bg-gray-800"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="h-12"
          >
            <Filter className="w-4 h-4 mr-2" />
            {t('filters')}
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full ml-2" />
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="h-12"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {t('reset')}
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Author Name */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('authorName')}
              </Label>
              <Input
                placeholder={t('enterName')}
                value={filters.author_name}
                onChange={(e) => setFilters({ author_name: e.target.value })}
              />
            </div>

            {/* Author Email */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('authorEmail')}
              </Label>
              <Input
                placeholder="example@mail.com"
                value={filters.author_email}
                onChange={(e) => setFilters({ author_email: e.target.value })}
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4" />
                {t('rating')}
              </Label>
              <Select 
                value={filters.rating?.toString() || 'all'} 
                onValueChange={(value) => setFilters({ rating: value === 'all' ? null : parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allRatings')}</SelectItem>
                  <SelectItem value="5">{t('fiveStars')}</SelectItem>
                  <SelectItem value="4">{t('fourStars')}</SelectItem>
                  <SelectItem value="3">{t('threeStars')}</SelectItem>
                  <SelectItem value="2">{t('twoStars')}</SelectItem>
                  <SelectItem value="1">{t('oneStar')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t('sort')}
              </Label>
              <Select 
                value={filters.sortBy} 
                onValueChange={(value: any) => setFilters({ sortBy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('newestFirst')}</SelectItem>
                  <SelectItem value="oldest">{t('oldestFirst')}</SelectItem>
                  <SelectItem value="rating_high">{t('ratingHigh')}</SelectItem>
                  <SelectItem value="rating_low">{t('ratingLow')}</SelectItem>
                  <SelectItem value="helpful">{t('mostHelpful')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setFilters({ is_verified: filters.is_verified === true ? null : true })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.is_verified === true
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <CheckCircle className="w-3 h-3 inline mr-1" />
              {t('verified')}
            </button>
            {/* <button
              onClick={() => setFilters({ is_featured: filters.is_featured === true ? null : true })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.is_featured === true
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Award className="w-3 h-3 inline mr-1" />
              {t('featured')}
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
}

// Pagination Component
function Pagination() {
  const { currentPage, totalItems, itemsPerPage, setPage } = useReviewsStore();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {startPage > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setPage(1)}
          >
            1
          </Button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map(page => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => setPage(page)}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <Button
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Main Page Component
export default function PageReviews() {
  const { reviews, loading, error, fetchReviews } = useReviewsStore();
  const { t } = useTranslation();

  useEffect(() => {
    fetchReviews();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
              {t('loadingError')}
            </h2>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/10 via-orange-400/5 to-transparent rounded-full animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/10 via-purple-400/5 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
              {t('clientReviews')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
              {t('reviewsDescription')}
            </p>
            
            {/* Add Review Button */}
            <div className="flex justify-center">
              <CompReviewForm onSuccess={() => {
                // Refresh reviews after successful creation
                // The form already calls fetchReviews internally
              }} />
            </div>
          </div>

          {/* Statistics */}
          <StatisticsCard />

          {/* Filters */}
          <ReviewFilters />

          {/* Reviews Grid */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {reviews.length === 0 && (
                <div className="text-center py-16">
                  <MessageCircle className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t('noReviewsFound')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('tryChangingSearchParams')}
                  </p>
                </div>
              )}

              <Pagination />
            </>
          )}
        </div>
      </div>
    </div>
  );
}