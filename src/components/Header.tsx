//src\components\Header.tsx
import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  Palette, 
  Home,
  Sparkles,
  Heart,
  Plus,
  MessageSquareText,
  Star
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { toast } from 'sonner';
import logo from '@/assets/images/Crocodil.jpg';
import ThemeSwitcher from "./ThemeSwitcher";
import CompLanguageSwitcher from "@/components/compLanguageSwitcher";
import { useTranslation } from "react-i18next";

export function Header() {
  const { user, setUser } = useUserStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  async function handleLogout() {
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(t('errorOnLogout'));
        return;
      }
      setUser(null);
      toast.success(t('loggedOutSuccessfully'));
      navigate({ to: '/' });
    } catch {
      toast.error(t('errorOnLogout'));
    }
  }

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-white via-gray-50/80 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/80 dark:to-blue-900/20 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-gray-800/40 pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/3 via-purple-400/2 to-transparent rounded-full animate-pulse pointer-events-none"></div>
      
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Логотип */}
          <Link 
            to="/route-main-paintings" 
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
            onClick={closeMobileMenu}
          >
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:rotate-3 overflow-hidden">
              <img 
                src={logo} 
                alt="Logo" 
                className="w-10 h-10 rounded-xl object-cover transition-transform duration-300 group-hover:scale-110" 
              />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-2xl bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                {t('gallery')}
              </h1>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Palette className="w-3 h-3" />
                <span>{t('artPlatform')}</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {/* Общие кнопки для всех пользователей */}
            <CompLanguageSwitcher />
            <ThemeSwitcher />
            
            {/* Home Button - для всех пользователей */}
            <Link to="/">
              <Button 
                variant="ghost" 
                size="sm"
                className="group bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Home className="w-4 h-4 mr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                <span className="text-sm">{t('home')}</span>
              </Button>
            </Link>

            {/* Reviews Button - для всех пользователей */}
            <Link to="/route-reviews">
              <Button 
                variant="ghost" 
                size="sm"
                className="group bg-white/40 dark:bg-yellow-800/40 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-yellow-800/80 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Star className="w-4 h-4 mr-2 group-hover:text-orange-600 dark:group-hover:text-yellow-400 transition-colors" />
                <span className="text-sm">{t('reviews')}</span>
              </Button>                  
            </Link>

            {/* Conversation Link - для всех пользователей */}
            <Link to="/route-conversations">
              <Button 
                variant="ghost" 
                size="sm"
                className="group bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <MessageSquareText className="w-4 h-4 mr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                <span className="text-sm">{t('conversation')}</span>
              </Button>
            </Link>

            {/* Кнопки только для авторизованных пользователей */}
            {user && (
              <>
                {/* Favorites for Collectors */}
                {user.role_id === 1 && (
                  <Link to="/user-page">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="group bg-gradient-to-r from-pink-100/80 to-rose-100/80 dark:from-pink-900/20 dark:to-rose-900/20 text-pink-700 dark:text-pink-300 hover:from-pink-200/80 hover:to-rose-200/80 dark:hover:from-pink-900/30 dark:hover:to-rose-900/30 hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      <span className="text-sm">{t('favorites')}</span>
                    </Button>
                  </Link>
                )}

                {/* Create Button for Artists */}
                {user.role_id === 2 && (
                  <Link to="/route-painting-create">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="group bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 hover:from-green-200/80 hover:to-emerald-200/80 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 hover:shadow-lg transition-all duration-300 hover:scale-105 border-0"
                    >
                      <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="text-sm font-medium">{t('create')}</span>
                    </Button>
                  </Link>
                )}

                {/* User Profile Button */}
                <Link to="/user-page">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="group bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <User className="w-4 h-4 mr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm">{t('profile')}</span>
                  </Button>
                </Link>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="group bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  title={t('exit')}
                >
                  <LogOut className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-sm">{t('logout')}</span>
                </Button>
              </>
            )}

            {/* Auth Buttons for Non-authenticated Users */}
            {!user && (
              <div className="flex items-center gap-3">
                <Link to="/route-login">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t('logIn')}
                  </Button>
                </Link>
                <Link to="/route-register">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {t('registration')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link to="/user-page">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-lg transition-all duration-300"
                  onClick={closeMobileMenu}
                >
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}    
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:shadow-lg transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 rotate-90 transition-transform duration-300" />
              ) : (
                <Menu className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 shadow-xl animate-slide-up">
            <div className="p-4 space-y-3 max-h-screen overflow-y-auto">
              {/* Общие элементы для всех пользователей */}
              <div className="flex items-center gap-2 pb-3">
                <CompLanguageSwitcher />
                <ThemeSwitcher />
              </div>
              
              {/* Home Link - для всех пользователей */}
              <Link to="/">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start group bg-white/40 dark:bg-gray-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                  onClick={closeMobileMenu}
                >
                  <Home className="w-4 h-4 mr-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  {t('home')}
                </Button>
              </Link>

              {/* Reviews Link - для всех пользователей */}
              <Link to="/route-reviews">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start group bg-white/40 dark:bg-yellow-800/40 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-300"
                  onClick={closeMobileMenu}
                >
                  <Star className="w-4 h-4 mr-3 group-hover:text-orange-600 dark:group-hover:text-yellow-400 transition-colors" />
                  {t('reviews')}
                </Button>
              </Link>

              {/* Conversation Link - для всех пользователей */}
              <Link to="/route-conversations">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start group bg-white/40 dark:bg-gray-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                  onClick={closeMobileMenu}
                >
                  <MessageSquareText className="w-4 h-4 mr-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  {t('conversation')}
                </Button>
              </Link>

              {/* Элементы только для авторизованных пользователей */}
              {user ? (
                <>
                  {/* Create Link for Artists */}
                  {user.role_id === 2 && (
                    <Link to="/route-painting-create">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start group bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 hover:from-green-200/80 hover:to-emerald-200/80 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-300"
                        onClick={closeMobileMenu}
                      >
                        <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                        {t('createPainting')}
                      </Button>
                    </Link>
                  )}

                  {/* Favorites for Collectors */}
                  {user.role_id === 1 && (
                    <Link to="/user-page">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start group bg-gradient-to-r from-pink-100/80 to-rose-100/80 dark:from-pink-900/20 dark:to-rose-900/20 text-pink-700 dark:text-pink-300 hover:from-pink-200/80 hover:to-rose-200/80 dark:hover:from-pink-900/30 dark:hover:to-rose-900/30 transition-all duration-300"
                        onClick={closeMobileMenu}
                      >
                        <Heart className="w-4 h-4 mr-3" />
                        {t('favorites')}
                      </Button>
                    </Link>
                  )}

                  {/* Profile Link */}
                  <Link to="/user-page">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start group bg-white/40 dark:bg-gray-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                      onClick={closeMobileMenu}
                    >
                      <User className="w-4 h-4 mr-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      {t('myProfile')}
                    </Button>
                  </Link>

                  {/* Logout */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start group bg-white/40 dark:bg-gray-800/40 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    {t('logout')}
                  </Button>
                </>
              ) : (
                /* Auth Buttons for Non-authenticated Users */
                <div className="space-y-3 border-t border-gray-200/50 dark:border-gray-700/50 pt-3">
                  <Link to="/route-login">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-300"
                      onClick={closeMobileMenu}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('loginToAccount')}
                    </Button>
                  </Link>
                  <Link to="/route-register">
                    <Button 
                      variant="outline" 
                      className="w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-300 dark:border-gray-600 transition-all duration-300"
                      onClick={closeMobileMenu}
                    >
                      {t('createAccount')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 opacity-60"></div>
          </div>
        )}
      </div>
    </header>
  );
}