// backend/controllers/notificationController.js
// =============================================

const Notification = require("../model/Notification");

/**
 * 🔧 Вспомогательная функция:
 *  - создаёт уведомление
 *  - сразу пушит его по Socket.IO в комнату user:<userId>
 */
const createAndPushNotification = async ({
  userId, // кому
  actorId, // кто
  type,
  entityType,
  entityId,
  message,
}) => {
  if (!userId || !actorId || !type) return null;

  const notification = await Notification.create({
    user: userId,
    actor: actorId,
    type,
    entityType,
    entityId,
    message,
  });

  // подтягиваем инфу об акторе
  const populated = await notification.populate(
    "actor",
    "_id username profilePicture email"
  );

  const payload = {
    _id: populated._id,
    type: populated.type,
    entityType: populated.entityType,
    entityId: populated.entityId,
    isRead: populated.isRead,
    createdAt: populated.createdAt,
    message: populated.message,
    actor: {
      _id: populated.actor._id,
      username: populated.actor.username,
      profilePicture: populated.actor.profilePicture || null,
    },
  };

  if (global.io) {
    global.io.to(`user:${userId}`).emit("notification:new", payload);
  }

  return payload;
};

/**
 * GET /notifications
 * Список уведомлений текущего пользователя
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("actor", "_id username profilePicture email");

    const data = notifications.map((n) => ({
      _id: n._id,
      type: n.type,
      entityType: n.entityType,
      entityId: n.entityId,
      isRead: n.isRead,
      createdAt: n.createdAt,
      message: n.message,
      actor: {
        _id: n.actor?._id,
        username: n.actor?.username,
        profilePicture: n.actor?.profilePicture || null,
      },
    }));

    return res.status(200).json({
      success: true,
      message: "Уведомления успешно получены",
      data,
    });
  } catch (err) {
    console.error("❌ Ошибка в getNotifications:", err);
    return res
      .status(500)
      .json({ success: false, message: "Внутренняя ошибка сервера" });
  }
};

/**
 * PATCH /notifications/read-all
 */
const markAllRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: "Все уведомления отмечены как прочитанные",
      data: null,
    });
  } catch (err) {
    console.error("❌ Ошибка в markAllRead:", err);
    return res
      .status(500)
      .json({ success: false, message: "Внутренняя ошибка сервера" });
  }
};

/**
 * PATCH /notifications/:id/read
 */
const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const n = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!n) {
      return res
        .status(404)
        .json({ success: false, message: "Уведомление не найдено" });
    }

    return res.status(200).json({
      success: true,
      message: "Уведомление отмечено как прочитанное",
      data: { _id: n._id, isRead: n.isRead },
    });
  } catch (err) {
    console.error("❌ Ошибка в markNotificationRead:", err);
    return res
      .status(500)
      .json({ success: false, message: "Внутренняя ошибка сервера" });
  }
};

module.exports = {
  createAndPushNotification,
  getNotifications,
  markAllRead,
  markNotificationRead,
};
