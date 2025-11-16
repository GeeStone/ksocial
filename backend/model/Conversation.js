// backend/model/Conversation.js
// =============================
// Модель диалога (личная переписка или групповой чат)
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // Участники диалога (для личных сообщений - обычно 2 пользователя)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // Флаг, если в будущем захочешь сделать групповые чаты
    isGroup: { type: Boolean, default: false },

    // Последнее сообщение (для отображения в списке диалогов)
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Индекс по участникам: ускоряет поиск диалогов
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
