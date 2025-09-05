// src/pages/PageNotFound.tsx
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  Palette,
  ImageOff,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function PageNotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

const goBack = () => {
  // Проверяем, есть ли история для возврата
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // Если истории нет, перенаправляем на главную
    navigate({ to: '/' });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 via-purple-400/3 to-transparent rounded-full animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/5 via-pink-400/3 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-gradient-to-br from-yellow-400/3 to-orange-400/2 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 px-6 py-12 max-w-4xl mx-auto text-center">
        {/* Main 404 illustration */}
        <div className="relative mb-8">
          {/* Large 404 text */}
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent opacity-20 select-none">
              404
            </h1>
            
            {/* Floating art elements */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative w-32 h-32 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-600/50 rotate-12 hover:rotate-6 transition-transform duration-500">
                <div className="absolute inset-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded-xl flex items-center justify-center">
                  <ImageOff className="w-8 h-8 text-gray-400 animate-bounce" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">?</span>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-10 left-1/4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg rotate-45 animate-pulse opacity-60"></div>
            <div className="absolute bottom-10 right-1/4 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/3 left-10 w-4 h-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-ping opacity-60"></div>
            <div className="absolute bottom-1/3 right-10 w-5 h-5 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg rotate-12 animate-pulse opacity-60" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Error message */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
              <Palette className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent mb-4">
            {t('pageNotFound')}
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('pageNotFoundDescription')}
          </p>
          
          <div className="text-sm text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 inline-block">
            {t('pageNotFoundFunMessage')}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-6">
          {/* Primary actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 w-full sm:w-auto"
              >
                <Home className="w-5 h-5 mr-2" />
                {t('toHomePage')}
              </Button>
            </Link>
            
            <Button 
              onClick={goBack}
              variant="outline"
              size="lg"
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('back')}
            </Button>
          </div>

          {/* Secondary actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/route-main-paintings">
              <Button 
                variant="ghost" 
                className="group bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 hover:shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                <Palette className="w-4 h-4 mr-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                {t('viewGallery')}
              </Button>
            </Link>
            
            <Link to="/route-reviews">
              <Button 
                variant="ghost" 
                className="group bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 hover:shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 mr-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" />
                {t('readReviews')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('pageNotFoundHelpText')}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-1">
              <Search className="w-3 h-3" />
              <span>{t('checkUrlSpelling')}</span>
            </div>
            <div className="flex items-center gap-1">
              <RotateCcw className="w-3 h-3" />
              <span>{t('refreshPage')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Home className="w-3 h-3" />
              <span>{t('returnToHomePage')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating animation elements */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-40"></div>
      <div className="absolute bottom-32 right-32 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-40" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/2 right-20 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-40"></div>
      <div className="absolute bottom-20 left-1/3 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '2.5s' }}></div>
    </div>
  );
}