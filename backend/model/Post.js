// backend/model/Post.js
// =====================
// Модель поста (запись в ленте: текст + медиа + лайки + комментарии)
const mongoose = require("mongoose");

// Отдельная схема под комментарии к посту
// Это нужно, чтобы можно было:
// - лайкать комментарии
// - делать ответы на комментарии (thread / ветка)
const commentSubSchema = new mongoose.Schema(
  {
    // Автор комментария
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Текст комментария
    text: { type: String, required: true, trim: true, maxlength: 1000 },

    // Для ответов на комментарии:
    // если это ответ, здесь будет _id родительского комментария в этом же посте
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Лайки на комментарии (кто лайкнул)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Дата создания комментария
    createdAt: { type: Date, default: Date.now },
  },
  {
    _id: true, // у каждого комментария будет свой _id (по умолчанию так и есть)
  }
);

const postSchema = new mongoose.Schema(
  {
    // Владелец поста
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Текстовое содержимое поста
    content: { type: String, trim: true, maxlength: 5000 },

    // Медиа (фото / видео)
    mediaUrl: { type: String, trim: true },

    // mediaType "video" пригодится для ленты видеозаписей (аналог ВК Видео)
    mediaType: { type: String, enum: ["image", "video"], default: "image" },

    // Лайки (список пользователей, поставивших лайк)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likeCount: { type: Number, default: 0 },

    // Комментарии (вложенные документы)
    // Теперь комментарии поддерживают:
    // - parentComment (ответы)
    // - likes (лайки на комментарии)
    comments: [commentSubSchema],
    commentCount: { type: Number, default: 0 },

    // Репосты
    // shares: пользователи, которые "поделились" постом
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    shareCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Индекс для ускорения выборки постов пользователя по времени
postSchema.index({ user: 1, createdAt: -1 });

// Хук перед сохранением: автоматически пересчитывает счётчики
postSchema.pre("save", function (next) {
  // количество лайков = длина массива likes
  this.likeCount = this.likes.length;

  // количество комментариев = длина массива comments
  this.commentCount = this.comments.length;

  // количество репостов = длина массива shares
  this.shareCount = this.shares.length;

  next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
