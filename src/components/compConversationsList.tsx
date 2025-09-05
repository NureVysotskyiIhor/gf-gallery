// src/components/compConversationsList.tsx - with localization
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useConversationStore } from '@/store/conversationStore';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from "react-i18next";
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Clock, 
  DollarSign,
  User,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Archive,
  Calendar,
  MessageSquare,
  Loader2,
  Palette
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ConversationFilters } from '@/lib/types/conversationTypes';

// Функция для форматирования времени
function formatLastMessageTime(dateString: string, t: any): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return t('justNow');
  if (diffInMinutes < 60) return t('minutesAgo', { count: diffInMinutes });
  if (diffInMinutes < 1440) return t('hoursAgo', { count: Math.floor(diffInMinutes / 60) });
  if (diffInMinutes < 10080) return t('daysAgo', { count: Math.floor(diffInMinutes / 1440) });
  
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short' 
  });
}

// Функция для получения иконки статуса
function getStatusIcon(status: string) {
  switch (status) {
    case 'active': return <MessageCircle className="w-4 h-4 text-green-500" />;
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'archived': return <Archive className="w-4 h-4 text-gray-500" />;
    default: return <MessageCircle className="w-4 h-4 text-gray-500" />;
  }
}

// Компонент карточки диалога
function ConversationCard({ conversation, onClick, t }: { 
  conversation: any; 
  onClick: () => void;
  t: any;
}) {
  const { user } = useUserStore();
  const isMyMessage = conversation.last_message?.sender_id === user?.id;

  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-5 hover:shadow-lg hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-200 cursor-pointer group relative overflow-hidden"
    >
      {/* Статус индикатор */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {getStatusIcon(conversation.status)}
        {conversation.unread_count > 0 && (
          <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
            {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
          </Badge>
        )}
      </div>

      {/* Участник диалога */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          {conversation.other_participant.avatar_url ? (
            <img
              src={conversation.other_participant.avatar_url}
              alt={conversation.other_participant.username || 'User'}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {conversation.other_participant.username || 'Пользователь'}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {conversation.topic && (
              <span className="inline-flex items-center gap-1">
                <Palette className="w-3 h-3" />
                {conversation.topic.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Заголовок диалога */}
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {conversation.title}
      </h3>

      {/* Последнее сообщение */}
      {conversation.last_message && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {isMyMessage && (
              <span className="text-blue-600 dark:text-blue-400 font-medium">{t('you')}</span>
            )}
            {conversation.last_message.content}
          </p>
        </div>
      )}

      {/* Бюджет и время */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-3">
          {(conversation.budget_min || conversation.budget_max) && (
            <span className="inline-flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {conversation.budget_min && conversation.budget_max
                ? `$${conversation.budget_min}-${conversation.budget_max}`
                : conversation.budget_min
                ? `от $${conversation.budget_min}`
                : `до $${conversation.budget_max}`
              }
            </span>
          )}
          {conversation.deadline && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(conversation.deadline).toLocaleDateString('ru-RU')}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatLastMessageTime(conversation.last_message_at, t)}
        </span>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-xl"></div>
    </div>
  );
}

// Компонент загрузки
function ConversationSkeleton() {
  return (
    <div className="bg-white/60 dark:bg-gray-900/60 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );
}

export function CompConversationsList() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { t } = useTranslation();
  const { 
    conversations, 
    loading, 
    error, 
    fetchConversations,
    subscribeToConversations,
    clearError
  } = useConversationStore();

  const [filters, setFilters] = useState<ConversationFilters>({
    status: 'all',
    search: '',
    has_unread: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Загружаем диалоги при монтировании и изменении фильтров
  useEffect(() => {
    if (user) {
      fetchConversations(filters);
    }
  }, [user, filters, fetchConversations]);

  // Подписываемся на real-time обновления
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToConversations(user.id);
    return unsubscribe;
  }, [user?.id, subscribeToConversations]);

  const handleConversationClick = (conversationId: string) => {
    navigate({ 
      to: '/route-conversation/$conversationId', 
      params: { conversationId } 
    });
  };

  const handleCreateNew = () => {
    navigate({ to: '/route-conversation-new' });
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    clearError();
    try {
      await fetchConversations(filters);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      has_unread: false
    });
  };

  const hasActiveFilters = filters.status !== 'all' || filters.search || filters.has_unread;
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-200 dark:from-blue-800 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('authorizationRequired')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('pleaseLoginForMessages')}
          </p>
          <Button
            onClick={() => navigate({ to: "/" })}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {t('goToHome')}
          </Button>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent mb-4">
              {t('myDialogs')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('discussOrdersAndCollaboration')}
            </p>
          </div>

          {/* Controls */}
          <div className="bg-gradient-to-r from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
            {/* Top row with search and new conversation button */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder={t('searchDialogs')}
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-12 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 px-4"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {t('filters')}
                  {hasActiveFilters && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></div>
                  )}
                </Button>
                
                <Button
                  onClick={handleCreateNew}
                  className="h-12 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('newDialog')}
                </Button>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <strong className="text-gray-900 dark:text-gray-100">{conversations.length}</strong> {t('dialogs')}
                </span>
                {totalUnread > 0 && (
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-red-500" />
                    <strong className="text-red-600 dark:text-red-400">{totalUnread}</strong> {t('unread')}
                  </span>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="h-8 px-3"
              >
                {(loading || refreshing) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Статус</label>
                    <Select 
                      value={filters.status || 'all'} 
                      onValueChange={(value: any) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allDialogs')}</SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            {t('active')}
                          </div>
                        </SelectItem>
                        <SelectItem value="completed">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                            {t('completed')}
                          </div>
                        </SelectItem>
                        <SelectItem value="cancelled">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            {t('cancelled')}
                          </div>
                        </SelectItem>
                        <SelectItem value="archived">
                          <div className="flex items-center gap-2">
                            <Archive className="w-4 h-4 text-gray-500" />
                            {t('archived')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('quickFilters')}</label>
                    <div className="flex gap-2">
                      <Button
                        variant={filters.has_unread ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilters({ ...filters, has_unread: !filters.has_unread })}
                        className="h-8"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {t('unreadMessages')}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('actions')}</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                      className="h-8"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      {t('reset')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main content */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">{t('loadingError')}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="ml-auto"
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('tryAgain')
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && conversations.length === 0 && (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <ConversationSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && conversations.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {hasActiveFilters ? t('nothingFound') : t('noDialogsYet')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {hasActiveFilters 
                  ? t('changeSearchParams')
                  : t('startNewDialogWithArtist')
                }
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('resetFilters')}
                </Button>
              ) : (
                <Button 
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createDialog')}
                </Button>
              )}
            </div>
          )}

          {/* Conversations list */}
          {!loading && conversations.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {conversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ConversationCard 
                    conversation={conversation}
                    onClick={() => handleConversationClick(conversation.id)}
                    t={t}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Load more if needed */}
          {!loading && conversations.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('shown', { count: conversations.length })}
                {totalUnread > 0 && (
                  <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                    ({totalUnread} {t('unread')})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}