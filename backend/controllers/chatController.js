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
 *
 * ⚠️ ЭТО КАК РАЗ ТО, ЧТО НУЖНО ДЛЯ КНОПКИ "НАПИСАТЬ СООБЩЕНИЕ" НА ПРОФИЛЕ
 * Фронт делает:
 * POST /chat/conversations { partnerId: profile._id }
 * и из ответа берёт _id диалога → router.push(`/chat/${conversation._id}`)
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

    // Ищем существующий диалог 1-на-1 между пользователями
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, partnerId] },
      isGroup: false,
    });

    // Если не нашли — создаём новый
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, partnerId],
      });
    }

    // Подгружаем участников для удобства фронта
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
 *
 * ✅ Добавлена проверка, что текущий пользователь действительно
 * участвует в указанном диалоге (без этого любой мог бы читать чужие чаты).
 */
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 20, before } = req.query;
    const currentUserId = req.user.userId;

    // Проверяем, что диалог существует и пользователь в нём участвует
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return response(res, 404, "Диалог не найден");
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId
    );

    if (!isParticipant) {
      return response(res, 403, "У вас нет доступа к этому диалогу");
    }

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
 *
 * ✅ Добавлена проверка, что текущий пользователь является участником диалога
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

    // Проверяем, что отправитель действительно участник диалога
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId
    );

    if (!isParticipant) {
      return response(
        res,
        403,
        "Вы не являетесь участником этого диалога и не можете отправлять сообщения"
      );
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
