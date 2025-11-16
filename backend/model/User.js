// backend/model/User.js
// =====================
// Модель пользователя (аккаунт)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Имя/никнейм пользователя
    username: { type: String, required: true, trim: true },

    // Email - уникален
    email: { type: String, required: true, unique: true, trim: true },

    // Пароль может быть null, если пользователь зашёл через Google OAuth
    password: { type: String, default: null },

    gender: { type: String, default: null },
    dateOfBirth: { type: Date, default: null },

    // Аватар и обложка профиля
    profilePicture: { type: String, default: null },
    coverPhoto: { type: String, default: null },

    // Подписчики (те, кто следят за пользователем)
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    // Подписки (на кого подписан пользователь)
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    // Числовые счётчики - для быстрого отображения, без лишних запросов
    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },

    // Ссылка на документ с расширенной биографией (UserBio)
    bio: { type: mongoose.Schema.Types.ObjectId, ref: "Bio", default: null },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
