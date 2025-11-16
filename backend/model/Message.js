// backend/model/Message.js
// ========================
// Модель сообщения в чате (личные сообщения / групповой чат)

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Диалог, к которому относится сообщение
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // Отправитель сообщения
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Текст сообщения
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Кто уже прочитал сообщение (на будущее, можно использовать для "прочитано")
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // createdAt = время отправки
  }
);

// Индекс по диалогу и дате - быстрый вывод истории сообщений
messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
