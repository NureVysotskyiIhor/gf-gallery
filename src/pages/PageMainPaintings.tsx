// src/components/PageMainPaintings.tsx
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select';
import { CompPaintingCardMainPage } from '@/components/compPaintingCardMainPage';
import { usePaintingListStore } from '@/store/paintingListStore';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from "react-i18next";
import { 
  Search,  
  SlidersHorizontal, 
  Grid3X3, 
  Grid2X2,
  List,
  TrendingUp,
  Calendar,
  DollarSign,
  User,
  X,
  RefreshCcw,
  Sparkles,
  Eye,
  Palette,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

// Filter types
interface FilterState {
  search: string;
  priceMin: string;
  priceMax: string;
  sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'title';
  author: string;
}

// View types
type ViewMode = 'grid-large' | 'grid-small' | 'list';

// Loading skeleton component
function PaintingCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-2xl shadow-lg overflow-hidden">
      {/* Image skeleton */}
      <div className="w-full h-56 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse relative overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <ImageIcon className="w-8 h-8 text-gray-400 animate-bounce" />
        </div>
        <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-500/20 to-transparent animate-[shimmer_2s_infinite]"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gradient-to-r from-gray-200 dark:from-gray-700 to-gray-600 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        <div className="flex justify-between items-center pt-3">
          <div className="h-6 bg-green-200 dark:bg-green-800 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Search header component
function SearchHeader({ 
  filters, 
  setFilters, 
  showFilters, 
  setShowFilters,
  viewMode,
  setViewMode,
  resultsCount,
  loading
}: {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  resultsCount: number;
  loading: boolean;
}) {
  const { t } = useTranslation();

  const clearFilters = () => {
    setFilters({
      search: '',
      priceMin: '',
      priceMax: '',
      sortBy: 'newest',
      author: ''
    });
  };

  const hasActiveFilters = filters.search || filters.priceMin || filters.priceMax || 
    filters.sortBy !== 'newest' || filters.author;

  return (
    <div className="bg-gradient-to-r from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
      {/* Main search bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={t('searchPaintings')}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-12 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {t('filters')}
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></div>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-12 px-4 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {t('reset')}
            </Button>
          )}
        </div>
      </div>

      {/* Results info and view controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('loading')}</span>
            </div>
          ) : (
            <>
              <Palette className="w-4 h-4 text-blue-500" />
              <span>
                {t('foundArtworks', { count: resultsCount })}
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">{t('view')}</span>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid-large')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid-large' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid-small')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid-small' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                {t('priceFrom')}
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                {t('priceTo')}
              </Label>
              <Input
                type="number"
                placeholder="1000"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm"
              />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                {t('author')}
              </Label>
              <Input
                placeholder={t('authorName')}
                value={filters.author}
                onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm"
              />
            </div>

            {/* Sort by */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                {t('sorting')}
              </Label>
              <Select value={filters.sortBy} onValueChange={(value: any) => setFilters({ ...filters, sortBy: value })}>
                <SelectTrigger className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      {t('newestFirst')}
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {t('oldestFirst')}
                    </div>
                  </SelectItem>
                  <SelectItem value="price_low">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      {t('priceAscending')}
                    </div>
                  </SelectItem>
                  <SelectItem value="price_high">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-red-500" />
                      {t('priceDescending')}
                    </div>
                  </SelectItem>
                  <SelectItem value="title">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      {t('byTitle')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PageMainPaintings() {
  const { paintings, loading, error, fetchPaintings, fetchFavoritePaintings } = usePaintingListStore();
  const { user } = useUserStore();
  const { t } = useTranslation();
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'newest',
    author: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid-large');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load paintings on mount
  useEffect(() => {
    const loadPaintings = async () => {
      await fetchPaintings();
      // Load favorites if user is authenticated
      if (user?.id) {
        await fetchFavoritePaintings(user.id);
      }
      setTimeout(() => setIsInitialLoad(false), 1000); // Simulate loading delay
    };
    loadPaintings();
  }, [fetchPaintings, fetchFavoritePaintings, user?.id]);

  // Load favorites when user logs in
  useEffect(() => {
    if (user?.id) {
      fetchFavoritePaintings(user.id);
    }
  }, [user?.id, fetchFavoritePaintings]);

  // Filter and sort paintings
  const filteredPaintings = useMemo(() => {
    let result = [...paintings];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(painting => 
        painting.title.toLowerCase().includes(searchLower) ||
        painting.description?.toLowerCase().includes(searchLower) ||
        painting.users?.username?.toLowerCase().includes(searchLower)
      );
    }

    // Price filters
    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin);
      result = result.filter(painting => 
        painting.price !== null && painting.price >= minPrice
      );
    }

    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax);
      result = result.filter(painting => 
        painting.price !== null && painting.price <= maxPrice
      );
    }

    // Author filter
    if (filters.author) {
      const authorLower = filters.author.toLowerCase();
      result = result.filter(painting => 
        painting.users?.username?.toLowerCase().includes(authorLower)
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'oldest':
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [paintings, filters]);

  // Grid classes based on view mode
  const getGridClass = () => {
    switch (viewMode) {
      case 'grid-large':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'grid-small':
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';
      case 'list':
        return 'grid grid-cols-1 gap-4';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
              {t('loadingError')}
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button 
              onClick={() => fetchPaintings()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {t('tryAgain')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 via-purple-400/3 to-transparent rounded-full animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/5 via-pink-400/3 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent mb-4">
              {t('artGallery')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('discoverAmazingArtworks')}
            </p>
          </div>

          {/* Search and filters */}
          <SearchHeader
            filters={filters}
            setFilters={setFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            resultsCount={filteredPaintings.length}
            loading={loading || isInitialLoad}
          />

          {/* Main content */}
          <div className="relative">
            {/* Loading state */}
            {(loading || isInitialLoad) && (
              <div className={getGridClass()}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <PaintingCardSkeleton key={index} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !isInitialLoad && filteredPaintings.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t('nothingFound')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {t('tryChangingFilters')}
                </p>
                <Button 
                  onClick={() => setFilters({
                    search: '',
                    priceMin: '',
                    priceMax: '',
                    sortBy: 'newest',
                    author: ''
                  })}
                  variant="outline"
                  className="bg-white dark:bg-gray-800"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {t('resetFilters')}
                </Button>
              </div>
            )}

            {/* Paintings grid */}
            {!loading && !isInitialLoad && filteredPaintings.length > 0 && (
              <div className={getGridClass()}>
                {filteredPaintings.map((painting, index) => (
                  <div
                    key={painting.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CompPaintingCardMainPage 
                      painting={painting}
                      priority={index < 6}
                      showAuthor={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Load more button */}
          {!loading && !isInitialLoad && filteredPaintings.length > 0 && (
            <div className="text-center mt-12">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('loadMore')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}