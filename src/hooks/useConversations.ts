// src/hooks/useConversations.ts - обновленная версия с лучшей интеграцией
import { useCallback, useEffect, useState } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import { useUserStore } from '@/store/userStore';
import type { ConversationFilters, CreateConversationData, SendMessageData } from '@/lib/types/conversationTypes';

/**
 * Кастомный хук для удобной работы с диалогами
 * Предоставляет высокоуровневые методы и автоматическое управление подписками
 */
export function useConversations() {
  const { user, isAuthenticated } = useUserStore();
  const store = useConversationStore();

  // Автоматически загружаем темы при монтировании
  useEffect(() => {
    if (isAuthenticated && store.topics.length === 0) {
      store.fetchTopics();
    }
  }, [store.fetchTopics, store.topics.length, isAuthenticated]);

  // Автоматически подписываемся на обновления диалогов
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const unsubscribe = store.subscribeToConversations(user.id);
    return unsubscribe;
  }, [user?.id, store.subscribeToConversations, isAuthenticated]);

  // Методы для работы с диалогами
  const loadConversations = useCallback(async (filters?: ConversationFilters) => {
    if (!isAuthenticated || !user) return;
    await store.fetchConversations(filters);
  }, [user, store.fetchConversations, isAuthenticated]);

  const loadConversation = useCallback(async (conversationId: string) => {
    if (!isAuthenticated) return;
    await store.fetchConversation(conversationId);
    await store.fetchMessages(conversationId);
  }, [store.fetchConversation, store.fetchMessages, isAuthenticated]);

  const createNewConversation = useCallback(async (data: CreateConversationData) => {
    if (!isAuthenticated) throw new Error('User not authenticated');
    return await store.createConversation(data);
  }, [store.createConversation, isAuthenticated]);

  const sendMessage = useCallback(async (data: SendMessageData) => {
    if (!isAuthenticated) throw new Error('User not authenticated');
    await store.sendMessage(data);
  }, [store.sendMessage, isAuthenticated]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!isAuthenticated) return;
    await store.markMessagesAsRead(conversationId);
  }, [store.markMessagesAsRead, isAuthenticated]);

  const updateStatus = useCallback(async (conversationId: string, status: string) => {
    if (!isAuthenticated) return;
    await store.updateConversationStatus(conversationId, status);
  }, [store.updateConversationStatus, isAuthenticated]);

  // Подписка на сообщения конкретного диалога
  const subscribeToConversation = useCallback((conversationId: string) => {
    if (!isAuthenticated) return () => {};
    return store.subscribeToMessages(conversationId);
  }, [store.subscribeToMessages, isAuthenticated]);

  // Вспомогательные геттеры
  const getUnreadCount = useCallback(() => {
    return store.conversations.reduce((sum, conv) => sum + conv.unread_count, 0);
  }, [store.conversations]);

  const getConversationById = useCallback((id: string) => {
    return store.conversations.find(conv => conv.id === id);
  }, [store.conversations]);

  const getActiveConversations = useCallback(() => {
    return store.conversations.filter(conv => conv.status === 'active');
  }, [store.conversations]);

  return {
    // State
    conversations: store.conversations,
    currentConversation: store.currentConversation,
    messages: store.messages,
    topics: store.topics,
    loading: store.loading,
    error: store.error,
    isAuthenticated,
    
    // Actions
    loadConversations,
    loadConversation,
    createNewConversation,
    sendMessage,
    markAsRead,
    updateStatus,
    subscribeToConversation,
    
    // Utility methods
    getUnreadCount,
    getConversationById,
    getActiveConversations,
    clearError: store.clearError,
    clearCurrentConversation: store.clearCurrentConversation,
  };
}

/**
 * Хук для работы с одним диалогом
 * Автоматически загружает диалог и подписывается на обновления
 */
export function useConversation(conversationId: string | undefined) {
  const conversationHook = useConversations();

  useEffect(() => {
    if (!conversationId || !conversationHook.isAuthenticated) return;

    // Загружаем диалог
    conversationHook.loadConversation(conversationId);
    
    // Подписываемся на real-time обновления
    const unsubscribe = conversationHook.subscribeToConversation(conversationId);

    // Отмечаем сообщения как прочитанные
    conversationHook.markAsRead(conversationId);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      conversationHook.clearCurrentConversation();
    };
  }, [conversationId, conversationHook.isAuthenticated]);

  return {
    conversation: conversationHook.currentConversation,
    messages: conversationHook.messages,
    loading: conversationHook.loading,
    error: conversationHook.error,
    isAuthenticated: conversationHook.isAuthenticated,
    sendMessage: (content: string) => 
      conversationId && conversationHook.isAuthenticated ? 
        conversationHook.sendMessage({
          conversation_id: conversationId,
          content,
          message_type: 'text'
        }) : 
        Promise.reject('No conversation ID or user not authenticated'),
    updateStatus: (status: string) => 
      conversationId && conversationHook.isAuthenticated ? 
        conversationHook.updateStatus(conversationId, status) : 
        Promise.reject('No conversation ID or user not authenticated'),
    markAsRead: () => 
      conversationId && conversationHook.isAuthenticated ? 
        conversationHook.markAsRead(conversationId) : 
        Promise.resolve(),
  };
}

/**
 * Улучшенный хук для поиска пользователей
 * Теперь использует метод из userStore
 */
export function useUserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const { searchUsers } = useUserStore();

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsers(query, true);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchUsers]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    clearResults: () => setSearchResults([])
  };
}