"use client";

import useChatStore from "@/app/store/useChatStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const getCompanion = (conv, currentUserId) => {
  if (!conv?.participants || conv.participants.length === 0) return null;
  return conv.participants.find((u) => String(u._id) !== String(currentUserId));
};

const ChatWindow = ({
  conversation,
  messages,
  loadingMessages,
  currentUserId,
}) => {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const { sendMessage, sending } = useChatStore();

  useEffect(() => {
    // скролл к последнему сообщению
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, conversation?._id]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        Выберите диалог слева, чтобы начать переписку.
      </div>
    );
  }

  const companion = getCompanion(conversation, currentUserId);
  const companionName =
    companion?.username || companion?.email || "Пользователь";

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await sendMessage(conversation._id, text);
      setText("");
    } catch {
      // ошибки уже логируются в сторе
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Хедер чата */}
      <div className="px-4 py-2 border-b border-border/40">
        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
          {companionName}
        </p>
        {companion?.email && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {companion.email}
          </p>
        )}
      </div>

      {/* Сообщения */}
      <ScrollArea className="flex-1 px-3 py-2">
        {loadingMessages ? (
          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Загружаем сообщения…
          </div>
        ) : messages.length === 0 ? (
          <div className="py-4 text-sm text-muted-foreground">
            Здесь пока нет сообщений. Напишите что-нибудь первым 😊
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {messages.map((msg) => {
              const mine =
                String(msg.sender?._id || msg.sender) === String(currentUserId);

              return (
                <div
                  key={msg._id}
                  className={`flex w-full ${
                    mine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs sm:text-sm
                      ${
                        mine
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }
                    `}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                    <p className="mt-0.5 text-[10px] opacity-70 text-right">
                      {msg.createdAt &&
                        new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Форма ввода */}
      <div className="border-t border-border/40 px-2 sm:px-3 py-2 flex items-center gap-2">
        <Input
          placeholder="Напишите сообщение…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-sm"
        />
        <Button
          size="icon"
          disabled={!text.trim() || sending}
          onClick={handleSend}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;
