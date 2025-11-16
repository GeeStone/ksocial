"use client";

import useChatStore from "@/app/store/useChatStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

const getCompanion = (conv, currentUserId) => {
  if (!conv?.participants || conv.participants.length === 0) return null;
  return conv.participants.find((u) => String(u._id) !== String(currentUserId));
};

const ConversationsList = ({
  conversations = [],
  loading = false,
  activeConversationId = null,
  onSelectConversation, // может быть undefined
  currentUserId,
}) => {
  // ✅ запасной вариант — берём openConversation прямо из стора
  const storeOpenConversation = useChatStore((state) => state.openConversation);

  const handleClickConversation = (id) => {
    if (typeof onSelectConversation === "function") {
      onSelectConversation(id);
    } else if (typeof storeOpenConversation === "function") {
      storeOpenConversation(id);
    } else {
      console.warn(
        "ConversationsList: нет функции для открытия диалога (onSelectConversation / storeOpenConversation)"
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-border/40">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Сообщения
        </h2>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Загружаем диалоги…
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="p-3 text-xs text-muted-foreground">
          У вас ещё нет диалогов. Напишите кому-нибудь из профиля 😊
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="py-1">
          {conversations.map((conv) => {
            const companion = getCompanion(conv, currentUserId);
            const name =
              companion?.username || companion?.email || "Пользователь";
            const initials =
              name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((s) => s[0])
                .join("")
                .toUpperCase() || "U";

            const lastMessage = conv?.lastMessage;
            const isActive = activeConversationId === conv._id;

            return (
              <button
                key={conv._id}
                type="button"
                onClick={() => handleClickConversation(conv._id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors
                  ${isActive ? "bg-accent/70" : "hover:bg-accent/40"}
                `}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {companion?.profilePicture ? (
                    <AvatarImage src={companion.profilePicture} alt={name} />
                  ) : (
                    <AvatarFallback>{initials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">
                    {name}
                  </p>
                  {lastMessage?.text && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {String(lastMessage.sender) === String(currentUserId)
                        ? "Вы: "
                        : ""}
                      {lastMessage.text}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationsList;
