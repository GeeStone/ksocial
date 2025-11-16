// backend/controllers/chatController.js
// =====================================
// REST-часть для личных сообщений (DM):
// - список диалогов
// - создание/поиск диалога
// - история сообщений
// - отправка сообщения

const Conversation = require("../model/Conversation");
const Message = require("../model/Message");
const response = require("../utils/responseHandler");

/**
 * Создать или получить диалог с другим пользователем
 * ==================================================
 * POST /chat/conversations
 * body: { partnerId }
 */
const createOrGetConversation = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { partnerId } = req.body;

    if (!partnerId) {
      return response(res, 400, "partnerId обязателен");
    }

    if (partnerId === currentUserId) {
      return response(res, 400, "Нельзя создать диалог с самим собой");
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, partnerId] },
      isGroup: false,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, partnerId],
      });
    }

    const populated = await Conversation.findById(conversation._id).populate(
      "participants",
      "_id username profilePicture email"
    );

    return response(res, 200, "Диалог успешно получен/создан", populated);
  } catch (error) {
    console.error("❌ Ошибка в createOrGetConversation:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Получить все диалоги текущего пользователя
 * ==========================================
 * GET /chat/conversations
 */
const getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate("participants", "_id username profilePicture email");

    return response(res, 200, "Диалоги успешно получены", conversations);
  } catch (error) {
    console.error("❌ Ошибка в getUserConversations:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Получить сообщения конкретного диалога
 * ======================================
 * GET /chat/conversations/:conversationId/messages?limit=20&before=<ISO>
 */
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 20, before } = req.query;

    const query = { conversation: conversationId };

    // Если передан параметр before — загружаем сообщения "до" указанной даты (для пагинации вверх)
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // сначала новые, потом можно развернуть на фронте
      .limit(Number(limit))
      .populate("sender", "_id username profilePicture");

    return response(res, 200, "Сообщения успешно получены", messages);
  } catch (error) {
    console.error("❌ Ошибка в getConversationMessages:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Отправить сообщение в диалог
 * ============================
 * POST /chat/messages/:conversationId
 * body: { text }
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const currentUserId = req.user.userId;

    if (!text || !text.trim()) {
      return response(res, 400, "Текст сообщения обязателен");
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return response(res, 404, "Диалог не найден");
    }

    // создаём сообщение
    const message = await Message.create({
      conversation: conversation._id,
      sender: currentUserId,
      text: text.trim(),
      readBy: [currentUserId],
    });

    // обновляем lastMessage / lastMessageAt в диалоге
    conversation.lastMessage = message.text;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    // подгружаем данные отправителя, чтобы фронту было удобно
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "_id username profilePicture"
    );

    // при желании отправляем в сокет-комнату (если Socket.IO инициализирован)
    if (global.io) {
      global.io.to(conversationId.toString()).emit("dm:message", {
        _id: populatedMessage._id,
        conversation: populatedMessage.conversation,
        sender: populatedMessage.sender,
        text: populatedMessage.text,
        createdAt: populatedMessage.createdAt,
      });
    }

    return response(res, 201, "Сообщение отправлено", populatedMessage);
  } catch (error) {
    console.error("❌ Ошибка в sendMessage:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

module.exports = {
  createOrGetConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
};
