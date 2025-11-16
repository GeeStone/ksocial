// backend/model/UserBio.js
// ========================
// Расширенная информация о пользователе (биография, город, отношения и т.п.)

const mongoose = require("mongoose");

const bioSchema = new mongoose.Schema(
  {
    bioText: { type: String, default: null, trim: true }, // "О себе"
    liveIn: { type: String, default: null, trim: true }, // Город проживания
    relationship: { type: String, default: null, trim: true }, // Семейное положение
    workplace: { type: String, default: null, trim: true }, // Место работы
    education: { type: String, default: null, trim: true }, // Образование
    phone: { type: String, default: null, trim: true }, // Телефон
    hometown: { type: String, default: null, trim: true }, // Родной город

    // Ссылка на пользователя, которому принадлежит эта биография
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

const Bio = mongoose.model("Bio", bioSchema);
module.exports = Bio;
