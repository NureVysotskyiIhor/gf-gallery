// src/store/conversationStore.ts - исправленная версия с фиксами TypeScript ошибок
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import type { 
  CommissionTopic,
  ExtendedConversation,
  ExtendedConversationMessage,
  CreateConversationData,
  SendMessageData,
  ConversationFilters,
  ConversationListResponse,
  ConversationMessage
} from '@/lib/types/conversationTypes';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface ConversationState {
  // State
  conversations: ExtendedConversation[];
  currentConversation: ExtendedConversation | null;
  messages: ExtendedConversationMessage[];
  topics: CommissionTopic[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTopics: () => Promise<void>;
  fetchConversationsFallback: (userId: string, filters?: ConversationFilters) => Promise<ExtendedConversation[]>;
  fetchConversations: (filters?: ConversationFilters) => Promise<void>;
  fetchConversation: (conversationId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  createConversation: (data: CreateConversationData) => Promise<string>;
  sendMessage: (data: SendMessageData) => Promise<void>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  updateConversationStatus: (conversationId: string, status: string) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToMessages: (conversationId: string) => () => void;
  subscribeToConversations: (userId: string) => () => void;
  
  // Utility actions
  addOptimisticMessage: (message: Partial<ExtendedConversationMessage>) => void;
  removeOptimisticMessage: (tempId: string) => void;
  updateMessageStatus: (tempId: string, message: ExtendedConversationMessage) => void;
  clearCurrentConversation: () => void;
  clearError: () => void;
}

// Utility function to safely handle empty strings and nulls
function safeString(value: string | null | undefined): string {
  return value?.trim() || '';
}

// Generate temporary ID for optimistic updates
function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  // Initial state
  conversations: [],
  currentConversation: null,
  messages: [],
  topics: [],
  loading: false,
  error: null,

  // Fetch commission topics
  fetchTopics: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('commission_topics')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      set({ topics: data || [] });
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch topics' });
    } finally {
      set({ loading: false });
    }
  },

  // Fallback метод для получения диалогов без RPC функции
  fetchConversationsFallback: async (userId: string) => { //userId: string, filters?: ConversationFilters
    try {
      // Получаем базовые диалоги
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1:participant_1_id(id, username, avatar_url),
          participant_2:participant_2_id(id, username, avatar_url),
          topic:topic_id(*)
        `)
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (convError) throw convError;

      // Для каждого диалога получаем последнее сообщение и количество непрочитанных
      const extendedConversations: ExtendedConversation[] = await Promise.all(
        (conversations || []).map(async (conv) => {
          try {
            // Последнее сообщение
            const { data: lastMessage } = await supabase
              .from('conversation_messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            // Количество непрочитанных сообщений
            const { count: unreadCount } = await supabase
              .from('conversation_messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .neq('sender_id', userId)
              .eq('is_read', false);

            // Определяем другого участника
            const otherParticipant = conv.participant_1_id === userId 
              ? conv.participant_2 
              : conv.participant_1;

            return {
              ...conv,
              last_message: lastMessage,
              unread_count: unreadCount || 0,
              other_participant: otherParticipant,
            };
          } catch (error) {
            console.error(`Error processing conversation ${conv.id}:`, error);
            // Возвращаем базовую версию при ошибке
            return {
              ...conv,
              last_message: null,
              unread_count: 0,
              other_participant: conv.participant_1_id === userId 
                ? conv.participant_2 
                : conv.participant_1,
            };
          }
        })
      );

      return extendedConversations;
    } catch (error) {
      console.error('Fallback method failed:', error);
      throw error;
    }
  },

  // Fetch user conversations with fallback
  fetchConversations: async (filters?: ConversationFilters) => {
    try {
      set({ loading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let conversations: ExtendedConversation[] = [];

      try {
        console.log('Trying RPC function get_user_conversations...');

        const { data, error } = await supabase
          .rpc('get_user_conversations', { p_user_id: user.id.trim() });

        if (error) {
          console.error('RPC error:', error);
          throw error;
        }

        conversations = ((data || []) as ConversationListResponse[]).map(item => {
          const isParticipant1 = item.participant_1_id === user.id;

          return {
            id: item.conversation_id,
            participant_1_id: item.participant_1_id,
            participant_2_id: item.participant_2_id,
            topic_id: null,
            title: safeString(item.title),
            status: safeString(item.status) as any,
            budget_min: item.budget_min,
            budget_max: item.budget_max,
            deadline: item.deadline,
            description: item.description ?? '',
            last_message_at: item.last_message_at,
            created_at: item.created_at,
            updated_at: item.updated_at,
            participant_1: {
              id: item.participant_1_id,
              username: safeString(item.participant_1_username),
              avatar_url: safeString(item.participant_1_avatar_url),
            },
            participant_2: {
              id: item.participant_2_id,
              username: safeString(item.participant_2_username),
              avatar_url: safeString(item.participant_2_avatar_url),
            },
            topic: safeString(item.topic_name) ? {
              id: 0,
              name: safeString(item.topic_name),
              description: null,
              icon: safeString(item.topic_icon),
              is_active: true,
              created_at: '',
            } : null,
            last_message: safeString(item.last_message_content) ? {
              id: '',
              conversation_id: item.conversation_id,
              sender_id: safeString(item.last_message_sender_id),
              content: safeString(item.last_message_content),
              message_type: 'text' as const,
              attachment_url: null,
              is_read: false,
              created_at: item.last_message_at,
              updated_at: item.last_message_at,
              sender: {
                id: safeString(item.last_message_sender_id),
                username: null,
                avatar_url: null,
              }
            } : null,
            unread_count: Number(item.unread_count) || 0,
            other_participant: isParticipant1
              ? {
                  id: item.participant_2_id,
                  username: safeString(item.participant_2_username),
                  avatar_url: safeString(item.participant_2_avatar_url),
                }
              : {
                  id: item.participant_1_id,
                  username: safeString(item.participant_1_username),
                  avatar_url: safeString(item.participant_1_avatar_url),
                }
          };
        });

      } catch (rpcError) {
        console.warn('RPC недоступен, используем fallback:', rpcError);
        conversations = await get().fetchConversationsFallback(user.id, filters);
      }

      // Применяем фильтры
      let filteredConversations = conversations;
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          filteredConversations = filteredConversations.filter(conv => conv.status === filters.status);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filteredConversations = filteredConversations.filter(conv => 
            conv.title.toLowerCase().includes(search) ||
            conv.other_participant.username?.toLowerCase().includes(search) ||
            conv.description?.toLowerCase().includes(search)
          );
        }
        if (filters.has_unread) {
          filteredConversations = filteredConversations.filter(conv => conv.unread_count > 0);
        }
      }

      set({ conversations: filteredConversations });
      console.log('Conversations loaded:', filteredConversations.length);

    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch conversations' });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch single conversation details
  fetchConversation: async (conversationId: string) => {
    try {
      set({ loading: true, error: null });
      console.log('Fetching conversation:', conversationId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1:participant_1_id(id, username, avatar_url),
          participant_2:participant_2_id(id, username, avatar_url),
          topic:topic_id(*)
        `)
        .eq('id', conversationId)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .single();

      if (error) {
        console.error('Error fetching conversation:', error);
        if (error.code === 'PGRST116') {
          set({ error: 'Диалог не найден или у вас нет к нему доступа' });
        } else {
          set({ error: error.message });
        }
        return;
      }

      console.log('Conversation data:', data);

      // Определяем другого участника
      const otherParticipant = data.participant_1_id === user.id 
        ? data.participant_2 
        : data.participant_1;

      const conversation: ExtendedConversation = {
        ...data,
        other_participant: otherParticipant,
        last_message: null,
        unread_count: 0,
      };

      set({ currentConversation: conversation });
      console.log('Current conversation set:', conversation);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch conversation' });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch messages for conversation
  fetchMessages: async (conversationId: string) => {
    try {
      set({ loading: true, error: null });
      console.log('Fetching messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('conversation_messages')
        .select(`
          *,
          sender:sender_id(id, username, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      const messages: ExtendedConversationMessage[] = data.map(msg => ({
        ...msg,
        sender: msg.sender,
      }));

      set({ messages });
      console.log('Messages loaded:', messages.length);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch messages' });
    } finally {
      set({ loading: false });
    }
  },

  // Create new conversation
  createConversation: async (data: CreateConversationData) => {
    try {
      set({ loading: true, error: null });
      console.log('Creating conversation with data:', data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Создаем диалог
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: user.id,
          participant_2_id: data.participant_id,
          topic_id: data.topic_id,
          title: data.title,
          description: data.description,
          budget_min: data.budget_min,
          budget_max: data.budget_max,
          deadline: data.deadline,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

      console.log('Conversation created:', conversation);

      // Отправляем первое сообщение
      const { error: msgError } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: data.initial_message,
          message_type: 'text',
        });

      if (msgError) {
        console.error('Error sending initial message:', msgError);
        throw msgError;
      }

      console.log('Initial message sent');

      // Обновляем список диалогов
      setTimeout(() => {
        get().fetchConversations();
      }, 500);

      return conversation.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create conversation' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Добавляем оптимистичное сообщение
  addOptimisticMessage: (message: Partial<ExtendedConversationMessage>) => {
    const { messages } = get();
    const optimisticMessage: ExtendedConversationMessage = {
      id: message.id || generateTempId(),
      conversation_id: message.conversation_id!,
      sender_id: message.sender_id!,
      content: message.content!,
      message_type: message.message_type || 'text',
      attachment_url: message.attachment_url || null,
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender: message.sender!,
    };
    
    set({ messages: [...messages, optimisticMessage] });
  },

  // Удаляем оптимистичное сообщение
  removeOptimisticMessage: (tempId: string) => {
    const { messages } = get();
    set({ messages: messages.filter(msg => msg.id !== tempId) });
  },

  // Обновляем статус сообщения
  updateMessageStatus: (tempId: string, message: ExtendedConversationMessage) => {
    const { messages } = get();
    set({ 
      messages: messages.map(msg => 
        msg.id === tempId ? message : msg
      ) 
    });
  },

  // Исправленная функция sendMessage - заменить в conversationStore.ts
  sendMessage: async (data: SendMessageData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Создаем временный ID для оптимистичного обновления
    const tempId = generateTempId();
    
    try {
      // Добавляем оптимистичное сообщение
      get().addOptimisticMessage({
        id: tempId,
        conversation_id: data.conversation_id,
        sender_id: user.id,
        content: data.content,
        message_type: data.message_type || 'text',
        attachment_url: data.attachment_url,
        sender: {
          id: user.id,
          username: user.user_metadata?.username || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        }
      });

      // Отправляем сообщение в базу данных
      const { data: messageData, error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: data.conversation_id,
          sender_id: user.id,
          content: data.content,
          message_type: data.message_type || 'text',
          attachment_url: data.attachment_url,
        })
        .select(`
          *,
          sender:sender_id(id, username, avatar_url)
        `)
        .single();

      if (error) throw error;

      console.log('Message sent successfully:', messageData);

      // Realtime подписка обработает замену оптимистичного сообщения на реальное
      // Но на всякий случай добавим fallback с задержкой
      setTimeout(() => {
        const { messages } = get();
        const stillOptimistic = messages.find(msg => msg.id === tempId);
        
        if (stillOptimistic && messageData) {
          console.log('Fallback: replacing optimistic message with real one');
          
          const realMessage: ExtendedConversationMessage = {
            ...messageData,
            sender: messageData.sender,
          };
          
          get().updateMessageStatus(tempId, realMessage);
        }
      }, 2000);

      // Обновляем last_message_at в диалоге
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.conversation_id);

    } catch (error) {
      console.error('Failed to send message:', error);
      // Удаляем оптимистичное сообщение при ошибке
      get().removeOptimisticMessage(tempId);
      set({ error: error instanceof Error ? error.message : 'Failed to send message' });
      throw error;
    }
  },

  // Mark messages as read - ИСПРАВЛЕННАЯ ВЕРСИЯ
  markMessagesAsRead: async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Используем оптимизированную функцию для массового обновления
      const { data: error } = await supabase
        .rpc('mark_conversation_messages_read', {
          p_conversation_id: conversationId,
          p_user_id: user.id
        });

      if (error) {
        console.error('Error marking messages as read:', error);
        // Fallback к старому методу
        const { error: fallbackError } = await supabase
          .from('conversation_messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .eq('is_read', false);
        
        if (fallbackError) throw fallbackError;
      }

      // Обновляем локальное состояние только если есть изменения
      const { messages, conversations } = get();
      
      // Обновляем сообщения
      set({
        messages: messages.map(msg =>
          msg.conversation_id === conversationId && msg.sender_id !== user.id && !msg.is_read
            ? { ...msg, is_read: true }
            : msg
        )
      });

      // Обновляем счетчик в списке диалогов
      set({
        conversations: conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, unread_count: 0 }
            : conv
        )
      });

    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  },

  // Update conversation status
  updateConversationStatus: async (conversationId: string, status: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('conversations')
        .update({ status })
        .eq('id', conversationId);

      if (error) throw error;

      // Обновляем локальное состояние
      const { currentConversation, conversations } = get();
      
      if (currentConversation?.id === conversationId) {
        set({ 
          currentConversation: { 
            ...currentConversation, 
            status: status as any 
          } 
        });
      }

      set({
        conversations: conversations.map(conv =>
          conv.id === conversationId ? { ...conv, status: status as any } : conv
        )
      });
    } catch (error) {
      console.error('Failed to update conversation status:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update conversation status' });
    } finally {
      set({ loading: false });
    }
  },

  // Исправленная функция subscribeToMessages - заменить в conversationStore.ts
  subscribeToMessages: (conversationId: string) => {
    console.log('Subscribing to messages for conversation:', conversationId);
    
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('New message received via realtime:', payload);
          
          try {
            const newMessage = payload.new as ConversationMessage;
            const { messages } = get();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) return;

            // Проверяем, не существует ли уже это сообщение
            const messageExists = messages.some(msg => msg.id === newMessage.id);
            
            if (messageExists) {
              console.log('Message already exists, skipping');
              return;
            }

            // Если это наше сообщение, ищем и заменяем оптимистичное
            if (newMessage.sender_id === user.id) {
              const optimisticMessage = messages.find(msg => 
                msg.id.startsWith('temp_') &&
                msg.content === newMessage.content &&
                Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 10000 // 10 секунд
              );

              if (optimisticMessage) {
                console.log('Replacing optimistic message with real one');
                
                // Получаем данные отправителя
                const { data: senderData } = await supabase
                  .from('users')
                  .select('id, username, avatar_url')
                  .eq('id', newMessage.sender_id)
                  .single();

                const realMessage: ExtendedConversationMessage = {
                  ...newMessage,
                  sender: senderData || { 
                    id: newMessage.sender_id, 
                    username: null, 
                    avatar_url: null 
                  }
                };

                // Заменяем оптимистичное сообщение на реальное
                set({ 
                  messages: messages.map(msg => 
                    msg.id === optimisticMessage.id ? realMessage : msg
                  ) 
                });
                return;
              }
            }

            // Добавляем новое сообщение от другого пользователя
            console.log('Adding new message from another user');
            
            const { data: senderData } = await supabase
              .from('users')
              .select('id, username, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();

            const completeMessage: ExtendedConversationMessage = {
              ...newMessage,
              sender: senderData || { 
                id: newMessage.sender_id, 
                username: null, 
                avatar_url: null 
              }
            };

            set({ messages: [...messages, completeMessage] });
            
          } catch (error) {
            console.error('Error processing realtime message:', error);
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Message updated via realtime:', payload);
          
          const updatedMessage = payload.new as ConversationMessage;
          const { messages } = get();
          
          set({
            messages: messages.map(msg =>
              msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
            )
          });
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status, 'for conversation:', conversationId);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to messages for conversation:', conversationId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to messages for conversation:', conversationId);
        }
      });

    return () => {
      console.log('Unsubscribing from messages for conversation:', conversationId);
      supabase.removeChannel(subscription);
    };
  },

  // Subscribe to conversations updates - ИСПРАВЛЕННАЯ ВЕРСИЯ
  subscribeToConversations: (userId: string) => {
    console.log('Subscribing to conversations for user:', userId);
    
    const subscription = supabase
      .channel(`conversations_and_messages:${userId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(participant_1_id=eq.${userId},participant_2_id=eq.${userId})`
        },
        async (payload) => {
          console.log('Conversations updated via realtime:', payload);
          
          try {
            const { currentConversation, conversations } = get();
            const updatedConversation = payload.new as any;
            
            // Если это обновление текущего диалога, обновляем его состояние
            if (currentConversation && currentConversation.id === updatedConversation?.id) {
              const mergedConversation = { ...currentConversation, ...updatedConversation };
              set({ currentConversation: mergedConversation });
            }
            
            // При значительных изменениях обновляем список диалогов
            if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
              // Небольшая задержка для завершения операции в БД
              setTimeout(() => {
                get().fetchConversations();
              }, 500);
            } else if (payload.eventType === 'UPDATE' && updatedConversation?.id) {
              // Обновляем конкретный диалог в списке
              set({
                conversations: conversations.map(conv =>
                  conv.id === updatedConversation.id ? { ...conv, ...updatedConversation } : conv
                )
              });
            }
          } catch (error) {
            console.error('Error processing conversation update:', error);
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages'
        },
        async (payload) => {
          console.log('New message in any conversation via realtime:', payload);
          
          try {
            const { data: { user } } = await supabase.auth.getUser();
            const newMessage = payload.new as ConversationMessage;
            
            if (user && newMessage.sender_id !== user.id) {
              // Это сообщение от другого пользователя
              const { conversations, currentConversation } = get();
              
              // Если это сообщение в текущем открытом диалоге, не увеличиваем счетчик
              const isCurrentConversation = currentConversation?.id === newMessage.conversation_id;
              
              if (!isCurrentConversation) {
                // Увеличиваем счетчик непрочитанных для соответствующего диалога
                set({
                  conversations: conversations.map(conv =>
                    conv.id === newMessage.conversation_id 
                      ? { 
                          ...conv, 
                          unread_count: conv.unread_count + 1,
                          last_message_at: newMessage.created_at 
                        }
                      : conv
                  )
                });
              } else {
                // Если диалог открыт, просто обновляем время последнего сообщения
                set({
                  conversations: conversations.map(conv =>
                    conv.id === newMessage.conversation_id 
                      ? { ...conv, last_message_at: newMessage.created_at }
                      : conv
                  )
                });
              }
            } else if (user && newMessage.sender_id === user.id) {
              // Это наше сообщение - обновляем время последнего сообщения
              const { conversations } = get();
              set({
                conversations: conversations.map(conv =>
                  conv.id === newMessage.conversation_id 
                    ? { ...conv, last_message_at: newMessage.created_at }
                    : conv
                )
              });
            }
          } catch (error) {
            console.error('Error processing new message notification:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Conversations subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from conversations for user:', userId);
      supabase.removeChannel(subscription);
    };
  },

  // Utility actions
  clearCurrentConversation: () => {
    set({ currentConversation: null, messages: [] });
  },

  clearError: () => {
    set({ error: null });
  },
}));