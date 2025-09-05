//src\pages\PageUserFromPainting.tsx
import { СompUserInfoCardFromPainting } from "@/components/compUserInfoCardFromPainting";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from 'react'
import type { ExtendedUser } from '@/lib/types/userTypes';

export default function PageUserFromPainting({userId} : {userId: string;}) {
  const [author, setAuthor] = useState<ExtendedUser | null>(null);
  const navigate = useNavigate();
  const {fetchUserById} = useUserStore()
    useEffect(() => {
    fetchUserById(userId).then(setAuthor);
    }, [userId, fetchUserById]);
  if (!author) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 via-purple-400/3 to-transparent rounded-full animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/5 via-pink-400/3 to-transparent rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-200 dark:from-blue-800 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Пользователь не найден
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Пожалуйста, войдите в систему для доступа к профилю
            </p>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться на главную
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
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/5 via-pink-400/3 to-transparent rounded-full animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Page header */}
        <div className="text-center pt-6 pb-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent mb-4">
            Профиль автора картины
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ячсячсясячсяся
          </p>
        </div>

        {/* User Info Card */}
        <section className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg animate-fade-in">
          <СompUserInfoCardFromPainting user={author} />
        </section>
      </div>
    </div>
  );
}