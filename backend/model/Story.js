// backend/model/Story.js
// ======================
// Модель сторис (временные истории, типа Instagram/Facebook Stories)

const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    // Владелец сторис
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Медиа (фото / видео)
    mediaUrl: { type: String, trim: true },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },

    // Срок жизни сторис
    // По умолчанию: сейчас + 24 часа (можно потом менять логику)
    expiresAt: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000,
    },

    // Мягкое удаление сторис
    // Когда пользователь удаляет свою сторис, мы помечаем её как удалённую
    // и не показываем в выборках
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Story = mongoose.model("Story", storySchema);
module.exports = Story;
