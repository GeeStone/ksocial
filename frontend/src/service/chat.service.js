// src/service/chat.service.js
// HTTP-запросы к /chat

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

const defaultOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

const handleJson = async (res) => {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message || data?.error || "Ошибка запроса к серверу";
    throw new Error(msg);
  }
  return data?.data ?? data;
};

/** Получить все диалоги текущего пользователя */
export const getConversations = async () => {
  const res = await fetch(`${API_URL}/chat/conversations`, {
    ...defaultOptions,
    method: "GET",
  });
  return handleJson(res);
};

/** Создать / получить диалог с пользователем
 *  backend ждёт body: { partnerId }
 */
export const createOrGetConversation = async (partnerId) => {
  const res = await fetch(`${API_URL}/chat/conversations`, {
    ...defaultOptions,
    method: "POST",
    body: JSON.stringify({ partnerId }),
  });
  return handleJson(res);
};

/** Получить сообщения диалога */
export const getMessages = async (conversationId) => {
  const res = await fetch(
    `${API_URL}/chat/conversations/${conversationId}/messages`,
    {
      ...defaultOptions,
      method: "GET",
    }
  );
  return handleJson(res);
};

/** Отправить сообщение
 * (для этого на бэкенде нужно будет добавить POST /chat/messages/:conversationId)
 */
export const sendMessage = async (conversationId, text) => {
  const res = await fetch(`${API_URL}/chat/messages/${conversationId}`, {
    ...defaultOptions,
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return handleJson(res);
};
