"use client";

import {
  sendMessage as apiSendMessage,
  createOrGetConversation,
  getConversations,
  getMessages,
} from "@/service/chat.service";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useChatStore = create(
  devtools((set, get) => ({
    conversations: [],
    activeConversationId: null,
    messages: [],

    loadingConversations: false,
    loadingMessages: false,
    sending: false,
    error: null,

    /** Загрузить список всех диалогов текущего пользователя */
    fetchConversations: async () => {
      try {
        set({ loadingConversations: true, error: null });
        const data = await getConversations();
        set({
          conversations: Array.isArray(data) ? data : [],
          loadingConversations: false,
        });
      } catch (e) {
        console.error("❌ Ошибка при загрузке диалогов:", e);
        set({
          loadingConversations: false,
          error: e.message || "Не удалось загрузить диалоги",
        });
      }
    },

    /** Открыть диалог по conversationId */
    openConversation: async (conversationId) => {
      if (!conversationId) return;
      set({ activeConversationId: conversationId });
      await get().fetchMessages(conversationId);
    },

    /**
     * Создать или получить диалог с пользователем (partnerId) и открыть его
     * Используем на профиле в кнопке "Написать сообщение"
     *
     * ВАЖНО: теперь функция ВОЗВРАЩАЕТ объект conv,
     * чтобы можно было сделать router.push(`/chat/${conv._id}`)
     */
    openConversationWithUser: async (partnerId) => {
      try {
        set({ error: null });

        const conv = await createOrGetConversation(partnerId);
        if (!conv?._id) return null;

        const exists = get().conversations.some((c) => c._id === conv._id);
        set((state) => ({
          conversations: exists
            ? state.conversations
            : [conv, ...state.conversations],
          activeConversationId: conv._id,
        }));

        await get().fetchMessages(conv._id);

        // 🔥 ВОТ ЭТО ДОБАВЛЕНО: чтобы вызвать дальше router.push(`/chat/${conv._id}`)
        return conv;
      } catch (e) {
        console.error("❌ Ошибка при создании / открытии диалога:", e);
        set({ error: e.message || "Не удалось открыть диалог" });
        return null;
      }
    },

    /** Загрузить сообщения диалога */
    fetchMessages: async (conversationId) => {
      if (!conversationId) return;
      try {
        set({ loadingMessages: true, error: null });
        const data = await getMessages(conversationId);

        // backend возвращает sort({ createdAt: -1 }) -> разворачиваем в хронологический порядок
        const ordered = Array.isArray(data) ? [...data].reverse() : [];

        set({ messages: ordered, loadingMessages: false });
      } catch (e) {
        console.error("❌ Ошибка при загрузке сообщений:", e);
        set({
          loadingMessages: false,
          error: e.message || "Не удалось загрузить сообщения",
        });
      }
    },

    /** Отправить сообщение в диалог */
    sendMessage: async (conversationId, text) => {
      if (!conversationId || !text?.trim()) return;
      try {
        set({ sending: true, error: null });

        const msg = await apiSendMessage(conversationId, text.trim());

        set((state) => ({
          messages: [...state.messages, msg],
          sending: false,
        }));
      } catch (e) {
        console.error("❌ Ошибка при отправке сообщения:", e);
        set({
          sending: false,
          error: e.message || "Не удалось отправить сообщение",
        });
        throw e;
      }
    },
  }))
);

export default useChatStore;
