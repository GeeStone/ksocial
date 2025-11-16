// backend/config/socket.js
// ========================
// Конфигурация Socket.IO для личных сообщений (DM) и уведомлений

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Conversation = require("../model/Conversation");
const Message = require("../model/Message");

/**
 * Инициализация Socket.IO сервера
 * @param {http.Server} httpServer - HTTP-сервер, созданный через http.createServer(app)
 * @returns {Server} экземпляр io
 */
const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Делаем io доступным глобально, чтобы использовать в контроллерах
  global.io = io;

  // === Мидлварь Socket.IO для аутентификации по JWT ===
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Токен не передан при подключении к Socket.IO"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = {
        userId: decoded.userId,
        email: decoded.email,
      };

      next();
    } catch (error) {
      console.error("❌ Ошибка аутентификации сокета:", error.message);
      next(new Error("Неверный или просроченный токен"));
    }
  });

  // === Основная логика работы с DM + подготовка под уведомления ===
  io.on("connection", (socket) => {
    const currentUserId = socket.user?.userId;
    console.log(`🔌 Пользователь подключился к Socket.IO: ${currentUserId}`);

    // 🔔 Личная комната для уведомлений и других событий
    if (currentUserId) {
      socket.join(`user:${currentUserId}`);
      console.log(
        `📨 Пользователь ${currentUserId} присоединился к комнате user:${currentUserId}`
      );
    }

    /**
     * DM: создать/войти в диалог
     */
    socket.on("dm:joinOrCreate", async ({ partnerId }) => {
      try {
        if (!partnerId || !currentUserId) return;

        let conversation = await Conversation.findOne({
          participants: { $all: [currentUserId, partnerId] },
          isGroup: false,
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [currentUserId, partnerId],
          });
        }

        const roomId = conversation._id.toString();
        socket.join(roomId);

        socket.emit("dm:joined", {
          conversationId: roomId,
          participants: conversation.participants,
          lastMessage: conversation.lastMessage,
          lastMessageAt: conversation.lastMessageAt,
        });

        console.log(
          `👥 Пользователь ${currentUserId} присоединился к диалогу ${roomId} с ${partnerId}`
        );
      } catch (error) {
        console.error("❌ Ошибка в dm:joinOrCreate:", error);
        socket.emit("dm:error", { message: "Не удалось открыть диалог" });
      }
    });

    // socket.on("dm:message"...)
    socket.on("dm:message", async ({ conversationId, text, tempId }) => {
      try {
        if (!conversationId || !text || !text.trim() || !currentUserId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit("dm:error", { message: "Диалог не найден" });
        }

        const message = await Message.create({
          conversation: conversation._id,
          sender: currentUserId,
          text: text.trim(),
          readBy: [currentUserId],
        });

        conversation.lastMessage = message.text;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();

        const payload = {
          _id: message._id,
          conversation: conversation._id,
          sender: currentUserId,
          text: message.text,
          createdAt: message.createdAt,
          readBy: message.readBy,
          tempId, // 👈 ВОЗВРАЩАЕМ обратно клиенту
        };

        io.to(conversationId).emit("dm:message", payload);
      } catch (error) {
        console.error("❌ Ошибка в dm:message:", error);
        socket.emit("dm:error", { message: "Не удалось отправить сообщение" });
      }
    });

    socket.on("dm:leave", ({ conversationId }) => {
      if (!conversationId) return;
      socket.leave(conversationId);
      console.log(
        `🚪 Пользователь ${currentUserId} вышел из диалога ${conversationId}`
      );
    });

    socket.on("disconnect", () => {
      console.log(`❌ Пользователь отключился от Socket.IO: ${currentUserId}`);
    });
  });

  return io;
};

module.exports = initSocketServer;
