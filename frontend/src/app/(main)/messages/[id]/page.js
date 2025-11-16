"use client";

import useChatStore from "@/app/store/useChatStore";
import useUserStore from "@/app/store/useUserStore"; // Импортируем для получения данных о пользователе
import LeftSideBar from "@/components/layout/LeftSideBar";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import ChatWindow from "../ChatWindow"; // Убедись, что путь правильный
import ConversationsList from "../ConversationsList"; // Убедись, что путь правильный

const MessagesPage = () => {
  const { id } = useParams(); // извлекаем conversationId из URL
  const { user } = useUserStore(); // Получаем данные текущего пользователя
  const { conversations, fetchMessages, activeConversationId } = useChatStore();

  useEffect(() => {
    fetchMessages(id);
  }, [id, activeConversationId, fetchMessages]);

  // Находим активный разговор
  const activeConversation = conversations.find((conv) => conv._id === id);

  if (!user) {
    return <div>Загрузка пользователя...</div>; // Добавим обработку отсутствия пользователя
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar или другое меню */}
      <LeftSideBar />

      {/* Основной контент чата */}
      <main className="flex-1 pt-20 sm:pt-24 pb-4 px-2 sm:px-4 lg:px-6">
        <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="md:w-1/3 lg:w-1/4 bg-white dark:bg-[rgb(36,37,38)] rounded-xl shadow-sm border border-border/40 flex flex-col min-h-[260px]">
            {/* Список диалогов */}
            <ConversationsList
              conversations={conversations}
              loading={false} // ты можешь добавить логику для loading
              activeConversationId={activeConversationId}
              onSelectConversation={() => {}}
              currentUserId={user?._id} // передаем текущий userId
            />
          </div>

          <div className="flex-1 bg-white dark:bg-[rgb(36,37,38)] rounded-xl shadow-sm border border-border/40 flex flex-col">
            {/* Окно чата */}
            <ChatWindow
              conversation={activeConversation}
              messages={activeConversation?.messages || []}
              loadingMessages={false} // Ты можешь установить состояние загрузки
              currentUserId={user?._id} // передаем текущий userId
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
