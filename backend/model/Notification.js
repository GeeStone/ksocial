// backend/model/Notification.js
// ============================
// Уведомления: лайки, комментарии, заявки в друзья, сообщения, посты, сторис

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // кому показываем уведомление
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // кто совершил действие
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // тип уведомления
    // like / comment / follow / friend_request / message / post / story / system
    type: {
      type: String,
      required: true,
    },

    // к чему относится
    entityType: {
      type: String, // "post" | "story" | "user" | "message"
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "entityType", // динамический ref
    },

    // готовый текст (опционально)
    message: {
      type: String,
      default: "",
    },

    // прочитано или нет
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
