// backend/utils/notify.js
// =======================
// Утилита для создания уведомлений и отправки их в реальном времени

const Notification = require("../model/Notification");

/**
 * Создать уведомление и, если поднят Socket.IO, отправить событие
 * @param {Object} options
 * @param {string|ObjectId} options.user        - кому уведомление
 * @param {string|ObjectId} options.actor      - кто совершил действие
 * @param {string} options.type                - тип ("like" | "comment" | "follow" | "message" | "system")
 * @param {string} [options.entityType]        - "post" | "user" | "conversation" | ...
 * @param {string|ObjectId} [options.entityId] - ID сущности
 * @param {string} [options.message]           - доп. текст
 */
const createNotificationAndEmit = async ({
  user,
  actor,
  type,
  entityType = "none",
  entityId = null,
  message = "",
}) => {
  // Не уведомляем самого себя
  if (String(user) === String(actor)) return null;

  // Создаём запись в БД
  const notification = await Notification.create({
    user,
    actor,
    type,
    entityType,
    entityId,
    message,
  });

  // Если Socket.IO инициализирован — шлём событие
  if (global.io) {
    const populated = await Notification.findById(notification._id)
      .populate("actor", "_id username profilePicture")
      .lean();

    // Личная комната пользователя: user:<userId>
    global.io.to(`user:${user}`).emit("notification:new", populated);
  }

  return notification;
};

module.exports = { createNotificationAndEmit };
