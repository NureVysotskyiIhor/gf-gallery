// src/pages/PageConversations.tsx
import { useNavigate } from '@tanstack/react-router';
import { CompConversationsList } from '@/components/compConversationsList';
import { CompConversationChat } from '@/components/compConversationChat';
import { CompCreateConversation } from '@/components/compCreateConversation';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from "react-i18next";
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';

// Главная страница диалогов - показывает список
export default function PageConversations() {
  const { user } = useUserStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-200  dark:from-blue-800 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <MessageCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('authorizationRequired')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('loginRequiredForDialogs')}
            </p>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('returnToHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <CompConversationsList />;
}

// Страница создания нового диалога
export function PageCreateConversation() {
  return <CompCreateConversation />;
}

// Страница отдельного диалога
export function PageConversationChat() {
  return <CompConversationChat />;
}