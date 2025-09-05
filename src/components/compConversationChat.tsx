// src/components/compConversationChat.tsx - версия с локализацией
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useConversationStore } from '@/store/conversationStore';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';
import {
  ArrowLeft,
  Send,
  User,
  Calendar,
  DollarSign,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Archive,
  MoreVertical,
  Info,
  Loader2,
  Clock,
  Check,
  CheckCheck,
  Image as ImageIcon,
  File,
  Sparkles,
  AlertCircle,
  WifiOff,
  ArrowDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ExtendedConversationMessage } from '@/lib/types/conversationTypes';

// Компонент индикатора набора текста
function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center animate-pulse">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Компонент индикатора статуса подключения
function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  const { t } = useTranslation();
  
  if (isConnected) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">{t('connectionLost')}</span>
        <span className="text-xs opacity-75">{t('messagesNotRealTime')}</span>
      </div>
    </div>
  );
}

// Компонент сообщения с улучшениями
function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar = true,
  isConsecutive = false 
}: { 
  message: ExtendedConversationMessage; 
  isOwn: boolean;
  showAvatar?: boolean;
  isConsecutive?: boolean;
}) {
  const { t } = useTranslation();
  
  const messageTime = new Date(message.created_at).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const messageDate = new Date(message.created_at);
  const today = new Date();
  const isToday = messageDate.toDateString() === today.toDateString();
  const isYesterday = new Date(today.getTime() - 86400000).toDateString() === messageDate.toDateString();
  
  let dateLabel = '';
  if (!isToday && !isYesterday) {
    dateLabel = messageDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  } else if (isYesterday) {
    dateLabel = t('yesterday');
  }

  return (
    <div className={`group relative ${isConsecutive ? 'mb-1' : 'mb-4'}`}>
      {/* Date separator */}
      {!isConsecutive && dateLabel && (
        <div className="flex items-center justify-center my-6">
          <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{dateLabel}</span>
          </div>
        </div>
      )}

      <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 w-8">
          {showAvatar && !isConsecutive && (
            <>
              {message.sender.avatar_url ? (
                <img
                  src={message.sender.avatar_url}
                  alt={message.sender.username || t('noName')}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-900 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Message content */}
        <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender name for consecutive messages */}
          {!isOwn && showAvatar && !isConsecutive && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
              {message.sender.username || t('noName')}
            </p>
          )}

          <div
            className={`relative px-4 py-3 shadow-sm transition-all duration-200 group-hover:shadow-md break-words ${
              isConsecutive 
                ? isOwn 
                  ? 'rounded-l-2xl rounded-tr-md rounded-br-2xl' 
                  : 'rounded-r-2xl rounded-tl-md rounded-bl-2xl'
                : 'rounded-2xl'
            } ${
              isOwn
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ml-auto'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Message content based on type */}
            {message.message_type === 'image' && message.attachment_url ? (
              <div className="space-y-2">
                <div className="relative group/image">
                  <img
                    src={message.attachment_url}
                    alt={t('previewImage')}
                    className="rounded-lg max-w-full h-auto cursor-pointer transition-transform hover:scale-105"
                    onClick={() => window.open(message.attachment_url!, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover/image:opacity-100 transition-opacity" />
                  </div>
                </div>
                {message.content && (
                  <p className="text-sm break-words">{message.content}</p>
                )}
              </div>
            ) : message.message_type === 'file' && message.attachment_url ? (
              <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                   onClick={() => window.open(message.attachment_url!, '_blank')}>
                <div className="flex-shrink-0">
                  <File className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.content || t('attachFile')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Нажмите для загрузки</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="whitespace-pre-wrap text-sm leading-relaxed break-words hyphens-auto">
                  {message.content}
                </p>
              </div>
            )}

            {/* Message time and status */}
            <div className={`flex items-center gap-1 mt-2 text-xs transition-opacity duration-200 ${
              isConsecutive 
                ? 'opacity-0 group-hover:opacity-100' 
                : 'opacity-70'
            } ${
              isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <Clock className="w-3 h-3" />
              <span>{messageTime}</span>
              {isOwn && (
                <div className="ml-1">
                  {message.is_read ? (
                    <span title={t('messageRead')}>
                      <CheckCheck className="w-3 h-3 text-blue-200" />
                    </span>
                  ) : (
                    <span title={t('messageDelivered')}>
                      <Check className="w-3 h-3 text-blue-300" />
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент заголовка диалога с улучшениями
function ConversationHeader({ conversation, onStatusChange }: { 
  conversation: any; 
  onStatusChange: (status: string) => void;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOnline] = useState(true);

  const getStatusBadge = (status: string) => {
    const badgeClasses = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800",
      completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800",
      archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800"
    };

    const statusLabels = {
      active: t('active'),
      completed: t('completed'), 
      cancelled: t('cancelled'),
      archived: t('archived')
    };

    return (
      <Badge className={`${badgeClasses[status as keyof typeof badgeClasses]} border`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate({ to: "/route-conversations" })}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              {conversation.other_participant.avatar_url ? (
                <img
                  src={conversation.other_participant.avatar_url}
                  alt={conversation.other_participant.username || t('noName')}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              
              {/* Online indicator */}
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {conversation.other_participant.username || t('noName')}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {conversation.title}
                </p>
                {isOnline && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {t('online')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(conversation.status)}
          
          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {}}>
                  <Info className="w-4 h-4 mr-2" />
                  {t('information')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {conversation.status === 'active' && (
                  <>
                    <DropdownMenuItem onClick={() => onStatusChange('completed')}>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                      {t('finish')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange('cancelled')}>
                      <XCircle className="w-4 h-4 mr-2 text-red-600" />
                      {t('cancelDialog')}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => onStatusChange('archived')}>
                  <Archive className="w-4 h-4 mr-2 text-gray-600" />
                  {t('archive')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Conversation details - улучшенный дизайн */}
      {(conversation.budget_min || conversation.budget_max || conversation.deadline) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {(conversation.budget_min || conversation.budget_max) && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full">
              <DollarSign className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                {conversation.budget_min && conversation.budget_max
                  ? `$${conversation.budget_min}-${conversation.budget_max}`
                  : conversation.budget_min
                  ? `от $${conversation.budget_min}`
                  : `до $${conversation.budget_max}`
                }
              </span>
            </div>
          )}
          {conversation.deadline && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                до {new Date(conversation.deadline).toLocaleDateString('ru-RU')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Улучшенный компонент поля ввода сообщения
function MessageInput({ 
  onSendMessage, 
  disabled 
}: { 
  onSendMessage: (content: string) => Promise<void>;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = async () => {
    if (!message.trim() || disabled || sending) return;

    setSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('sendMessageError'));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 p-4 sticky bottom-0">
      {disabled && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              {t('dialogInactive')}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`${t('writeMessage')} ${t('enterToSend')}`}
            disabled={disabled || sending}
            className="min-h-[48px] max-h-[120px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 resize-none pr-24 rounded-xl transition-all duration-200 focus:shadow-lg"
            style={{ height: '48px' }}
          />
          
          <div className="absolute right-3 bottom-3 flex gap-1">
            {/* <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled
              title={t('attachFile')}
            >
              <Paperclip className="w-4 h-4" />
            </Button> */}
            {/* <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled
              title={t('emoji')}
            >
              <Smile className="w-4 h-4" />
            </Button> */}
          </div>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled || sending}
          className="h-12 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Character count for long messages */}
      {message.length > 800 && (
        <div className="flex justify-end mt-2">
          <span className={`text-xs ${message.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
            {t('charactersCount', { current: message.length, max: 1000 })}
          </span>
        </div>
      )}
    </div>
  );
}

// Основной компонент диалога
export function CompConversationChat() {
  const navigate = useNavigate();
  const params = useParams({ from: '/route-conversation/$conversationId' });
  const { user } = useUserStore();
  const { t } = useTranslation();
  const {
    currentConversation,
    messages,
    loading,
    error,
    fetchConversation,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    updateConversationStatus,
    subscribeToMessages,
    clearCurrentConversation
  } = useConversationStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [unsubscribeMessages, setUnsubscribeMessages] = useState<(() => void) | null>(null);
  const [isConnected] = useState(true);
  const [showTyping] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);

  // Стабильная функция скролла
  const scrollToBottom = useCallback((smooth = true) => {
    if (!messagesEndRef.current) return;
    
    try {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    } catch (error) {
      // Fallback для старых браузеров
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  }, []);

  // Проверка, находится ли пользователь внизу чата
  const checkIfNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const threshold = 150;
    const isNear = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    
    if (isNear !== isNearBottom) {
      setIsNearBottom(isNear);
      if (isNear) {
        setNewMessagesCount(0);
      }
    }
  }, [isNearBottom]);

  // Скролл при изменении сообщений
  useEffect(() => {
    if (messages.length > 0) {
      if (autoScroll && isNearBottom) {
        // Небольшая задержка для завершения рендеринга
        setTimeout(() => scrollToBottom(true), 50);
      } else if (!isNearBottom) {
        setNewMessagesCount(prev => prev + 1);
      }
    }
  }, [messages.length, autoScroll, isNearBottom, scrollToBottom]);

  // Обработчик скролла с дебаунсом
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        checkIfNearBottom();
      }, 100);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [checkIfNearBottom]);

  // Загружаем диалог и сообщения
  useEffect(() => {
    if (!params.conversationId) return;

    let isMounted = true;

    const loadData = async () => {
      try {
        await Promise.all([
          fetchConversation(params.conversationId),
          fetchMessages(params.conversationId)
        ]);

        if (isMounted) {
          // Подписываемся на real-time сообщения
          const unsubscribe = subscribeToMessages(params.conversationId);
          setUnsubscribeMessages(() => unsubscribe);
          
          // Первичный скролл после загрузки
          setTimeout(() => {
            scrollToBottom(false);
            setAutoScroll(true);
          }, 100);
        }
      } catch (error) {
        console.error('Error loading conversation data:', error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
      clearCurrentConversation();
      setAutoScroll(false);
    };
  }, [params.conversationId]);

  // Отмечаем сообщения как прочитанные
  useEffect(() => {
    if (!params.conversationId || !user) return;

    const timeoutId = setTimeout(() => {
      if (isNearBottom && messages.length > 0) {
        markMessagesAsRead(params.conversationId);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [params.conversationId, user, messages.length, isNearBottom]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!params.conversationId || !content.trim()) return;
    
    try {
      // Принудительно скролим вниз при отправке своего сообщения
      setAutoScroll(true);
      setIsNearBottom(true);
      
      await sendMessage({
        conversation_id: params.conversationId,
        content: content.trim(),
        message_type: 'text'
      });
      
      // Скролим после отправки
      setTimeout(() => scrollToBottom(true), 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('sendMessageError'));
    }
  }, [params.conversationId, sendMessage, scrollToBottom, t]);

  const handleStatusChange = async (status: string) => {
    if (!params.conversationId) return;
    
    try {
      await updateConversationStatus(params.conversationId, status);
      toast.success(t('dialogStatusUpdated'));
    } catch (error) {
      toast.error(t('statusUpdateError'));
    }
  };

  // Обработчик кнопки "Вниз"
  const handleScrollToNewMessages = useCallback(() => {
    setAutoScroll(true);
    setIsNearBottom(true);
    setNewMessagesCount(0);
    scrollToBottom(true);
  }, [scrollToBottom]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('authorizationRequiredDialog')}
          </h2>
          <Button onClick={() => navigate({ to: "/" })}>
            {t('goToHomePage')}
          </Button>
        </div>
      </div>
    );
  }

  if (loading && !currentConversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{t('loadingDialog')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentConversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('dialogNotFound')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || t('dialogDeletedNoAccess')}
          </p>
          <Button onClick={() => navigate({ to: "/route-conversations" })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('toDialogsList')}
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
      
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <ConversationHeader 
          conversation={currentConversation} 
          onStatusChange={handleStatusChange}
        />

        {/* Messages area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="max-w-4xl mx-auto p-4 pb-6">
            {/* Connection status */}
            <ConnectionStatus isConnected={isConnected} />

            {/* Conversation info */}
            {currentConversation.description && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t('conversationDescription')}
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed break-words">
                      {currentConversation.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-0">
              {messages.length === 0 && !loading ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t('startConversation')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    {t('sendFirstMessage')}
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender_id === user.id;
                  const prevMessage = messages[index - 1];
                  
                  // Логика группировки сообщений
                  const showAvatar = !prevMessage || 
                    prevMessage.sender_id !== message.sender_id ||
                    new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000; // 5 минут
                  
                  const isConsecutive = prevMessage && 
                    prevMessage.sender_id === message.sender_id &&
                    new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 300000;
                  
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      isConsecutive={isConsecutive}
                    />
                  );
                })
              )}
              
              {/* Typing indicator */}
              {showTyping && <TypingIndicator />}
              
              {/* Loading indicator for new messages */}
              {loading && messages.length > 0 && (
                <div className="flex justify-center py-4">
                  <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{t('loading')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll to bottom button */}
        {!isNearBottom && (
          <div className="absolute bottom-24 right-6 z-20">
            <Button
              onClick={handleScrollToNewMessages}
              className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 p-0"
              title={t('goToNewMessages')}
            >
              <div className="relative">
                <ArrowDown className="w-5 h-5" />
                {newMessagesCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {newMessagesCount > 99 ? '99+' : newMessagesCount}
                  </div>
                )}
              </div>
            </Button>
          </div>
        )}

        {/* Message input */}
        <MessageInput 
          onSendMessage={handleSendMessage}
          disabled={currentConversation.status !== 'active'}
        />
      </div>
    </div>
  );
}