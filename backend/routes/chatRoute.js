// backend/routes/chatRoute.js
// ===========================
// Маршруты для личных сообщений:
// - создать / получить диалог
// - получить список всех диалогов
// - получить сообщения диалога
// - отправить сообщение в диалог

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createOrGetConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
} = require("../controllers/chatController");

// Создать или найти диалог с пользователем
// POST /chat/conversations
router.post("/conversations", authMiddleware, createOrGetConversation);

// Получить список всех диалогов текущего пользователя
// GET /chat/conversations
router.get("/conversations", authMiddleware, getUserConversations);

// Получить историю сообщений диалога
// GET /chat/conversations/:conversationId/messages
router.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  getConversationMessages
);

// Отправить сообщение в диалог
// POST /chat/messages/:conversationId
router.post("/messages/:conversationId", authMiddleware, sendMessage);

module.exports = router;
