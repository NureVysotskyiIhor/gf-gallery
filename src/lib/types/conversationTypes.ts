// src/lib/types/conversationTypes.ts

export interface CommissionTopic {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ConversationParticipant {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  topic_id: number | null;
  title: string;
  status: 'active' | 'completed' | 'cancelled' | 'archived';
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  description: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface ExtendedConversation extends Conversation {
  participant_1: ConversationParticipant;
  participant_2: ConversationParticipant;
  topic: CommissionTopic | null;
  last_message: ConversationMessage | null;
  unread_count: number;
  other_participant: ConversationParticipant; // Участник, который НЕ текущий пользователь
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExtendedConversationMessage extends ConversationMessage {
  sender: ConversationParticipant;
}

export interface CreateConversationData {
  participant_id: string; // ID пользователя, с которым начинаем диалог
  topic_id: number;
  title: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  initial_message: string;
}

export interface SendMessageData {
  conversation_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file';
  attachment_url?: string;
}

export interface ConversationFilters {
  status?: 'active' | 'completed' | 'cancelled' | 'archived' | 'all';
  topic_id?: number;
  search?: string;
  has_unread?: boolean;
}

// Вспомогательные типы для API
export interface ConversationListResponse {
  conversation_id: string;
  participant_1_id: string;
  participant_1_username: string | null;
  participant_1_avatar_url: string | null;
  participant_2_id: string;
  participant_2_username: string | null;
  participant_2_avatar_url: string | null;
  topic_name: string | null;
  topic_icon: string | null;
  title: string;
  status: string;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  description: string | null;
  last_message_content: string | null;
  last_message_sender_id: string | null;
  last_message_at: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

// Константы для статусов
export const CONVERSATION_STATUSES = {
  ACTIVE: 'active' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  ARCHIVED: 'archived' as const,
} as const;

export const MESSAGE_TYPES = {
  TEXT: 'text' as const,
  IMAGE: 'image' as const,
  FILE: 'file' as const,
  SYSTEM: 'system' as const,
} as const;

// Предопределенные темы с иконками (Lucide React)
export const COMMISSION_TOPIC_ICONS = {
  portrait: 'User',
  landscape: 'Mountain', 
  abstract: 'Sparkles',
  still_life: 'Apple',
  illustration: 'PenTool',
  digital_art: 'Monitor',
  wedding: 'Heart',
  pet_portrait: 'PawPrint',
  architecture: 'Building',
  fantasy: 'Wand2',
  commission: 'MessageCircle',
  restoration: 'RefreshCw',
} as const;

export type ConversationStatus = keyof typeof CONVERSATION_STATUSES;
export type MessageType = keyof typeof MESSAGE_TYPES;