"use client";

import useChatStore from "@/app/store/useChatStore";
import useUserStore from "@/app/store/useUserStore";
import LeftSideBar from "@/components/layout/LeftSideBar";
import { useEffect } from "react";
import ChatWindow from "./ChatWindow";
import ConversationsList from "./ConversationsList";

const MessagesPage = () => {
  const {
    conversations,
    activeConversationId,
    messages,
    loadingConversations,
    loadingMessages,
    fetchConversations,
    openConversation, // ✅ именно эту функцию пробрасываем вниз
  } = useChatStore();

  const { user } = useUserStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <LeftSideBar />

      <main className="flex-1 pt-20 sm:pt-24 pb-4 px-2 sm:px-4 lg:px-6">
        <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-3 sm:gap-4">
          {/* Список диалогов */}
          <div className="md:w-1/3 lg:w-1/4 bg-white dark:bg-[rgb(36,37,38)] rounded-xl shadow-sm border border-border/40 flex flex-col min-h-[260px]">
            <ConversationsList
              conversations={conversations}
              loading={loadingConversations}
              activeConversationId={activeConversationId}
              onSelectConversation={openConversation} // ✅ передаём функцию
              currentUserId={user?._id}
            />
          </div>

          {/* Окно чата */}
          <div className="flex-1 bg-white dark:bg-[rgb(36,37,38)] rounded-xl shadow-sm border border-border/40 flex flex-col">
            <ChatWindow
              conversation={activeConversation}
              messages={messages}
              loadingMessages={loadingMessages}
              currentUserId={user?._id}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
