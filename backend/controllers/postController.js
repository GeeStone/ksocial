// backend/controllers/postController.js
// =====================================
// Посты, лайки, комментарии, репосты и сторис

const Post = require("../model/Post");
const Story = require("../model/Story");
const response = require("../utils/responseHandler");
const { uploadFileToYandex } = require("../config/storage");
const { createNotificationAndEmit } = require("../utils/notify");
const { createAndPushNotification } = require("./notificationController");
const User = require("../model/User");

/**
 * Создание нового поста
 * =====================
 * POST /posts
 */
const createPost = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return response(res, 400, "Пользователь не авторизован");
    }

    const user = await User.findById(userId);
    if (!user) {
      return response(res, 404, "Пользователь не найден");
    }

    const content = req.body.content ? req.body.content.trim() : "";
    const file = req.file || null;

    if (!content && !file) {
      return response(res, 400, "Нужно передать текст или медиа для поста");
    }

    let mediaUrl = null;
    let mediaType = null;

    if (file) {
      const uploadResult = await uploadFileToYandex(file, "posts");
      mediaUrl = uploadResult.url;
      mediaType = file.mimetype.startsWith("video") ? "video" : "image";
    }

    const newPost = new Post({
      user: userId,
      content,
      mediaUrl,
      mediaType,
    });

    await newPost.save();

    // Популяция пользователя с данными
    const populatedPost = await Post.findById(newPost._id).populate(
      "user",
      "_id username profilePicture email"
    );

    return response(res, 201, "Пост успешно создан", populatedPost);
  } catch (error) {
    console.error("❌ Ошибка при создании поста:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Создание сторис
 * ===============
 * POST /posts/story
 */
const createStory = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const file = req.file;

    if (!file) {
      return response(res, 400, "Для сторис нужно передать файл");
    }

    const uploadResult = await uploadFileToYandex(file, "stories");
    const mediaUrl = uploadResult.url;
    const mediaType = file.mimetype.startsWith("video") ? "video" : "image";

    const newStory = new Story({
      user: userId,
      mediaUrl,
      mediaType,
      // expiresAt и isDeleted проставятся из схемы Story по умолчанию
    });

    await newStory.save();

    return response(res, 201, "Сторис успешно создана", newStory);
  } catch (error) {
    console.error("❌ Ошибка при создании сторис:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Получить все актуальные сторис
 * ==============================
 * GET /posts/story
 * (показываем только не удалённые и не истёкшие сторис)
 */
const getAllStory = async (_req, res) => {
  try {
    const now = new Date();

    const story = await Story.find({
      isDeleted: false,
      expiresAt: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .populate("user", "_id username profilePicture email");

    return response(res, 200, "Сторис успешно получены", story);
  } catch (error) {
    console.error("❌ Ошибка при получении сторис:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Получить все посты
 * ==================
 * GET /posts
 */
const getAllPosts = async (_req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "_id username profilePicture email") // Добавлено популяция данных о пользователе
      .populate({
        path: "comments.user",
        select: "username profilePicture",
      });

    return response(res, 200, "Посты успешно получены", posts);
  } catch (error) {
    console.error("❌ Ошибка при получении постов:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Получить один пост по ID
 * ========================
 * GET /posts/:postId
 */
const getPostById = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId)
      .populate("user", "_id username profilePicture email")
      .populate({
        path: "comments.user",
        select: "username profilePicture",
      });

    if (!post) {
      return response(res, 404, "Пост не найден");
    }

    return response(res, 200, "Пост успешно получен", post);
  } catch (error) {
    console.error("❌ Ошибка при получении поста:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Лента видеозаписей (посты с mediaType = "video")
 * ================================================
 * GET /posts/videos
 */
const getVideoPosts = async (_req, res) => {
  try {
    const videos = await Post.find({ mediaType: "video" })
      .sort({ createdAt: -1 })
      .populate("user", "_id username profilePicture email")
      .populate({
        path: "comments.user",
        select: "username profilePicture",
      });

    return response(res, 200, "Видеопосты успешно получены", videos);
  } catch (error) {
    console.error("❌ Ошибка при получении видеопостов:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Получить посты пользователя
 * ===========================
 * GET /posts/user/:userId
 */
const getPostByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await Post.find({ user: userId }) // Фильтруем по userId
      .sort({ createdAt: -1 })
      .populate("user", "_id username profilePicture email")
      .populate({
        path: "comments.user",
        select: "username profilePicture",
      });

    return response(res, 200, "Посты пользователя успешно получены", posts);
  } catch (error) {
    console.error("❌ Ошибка при получении постов пользователя:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Лайк/анлайк поста (toggle)
 * ==========================
 * POST /posts/likes/:postId
 */
const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user?.userId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return response(res, 404, "Пост не найден");
    }

    const hasLiked = post.likes.some((id) => String(id) === String(userId));

    if (hasLiked) {
      post.likes = post.likes.filter((id) => String(id) !== String(userId));
    } else {
      post.likes.push(userId);

      // 🔔 Уведомление владельцу поста о лайке
      if (String(post.user) !== String(userId)) {
        await createNotificationAndEmit({
          user: post.user,
          actor: userId,
          type: "like",
          entityType: "post",
          entityId: post._id,
        });
      }
    }

    await post.save(); // pre('save') пересчитает likeCount

    const isLiked = !hasLiked;

    return response(res, 200, isLiked ? "Лайк поставлен" : "Лайк снят", {
      postId: post._id,
      likeCount: post.likeCount,
      isLiked,
    });
  } catch (error) {
    console.error("❌ Ошибка в likePost:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Добавить комментарий к посту
 * ============================
 * POST /posts/comments/:postId
 */
const addCommentToPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user?.userId;

  const text =
    req.body && typeof req.body.text === "string" ? req.body.text.trim() : "";

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return response(res, 404, "Пост не найден");
    }

    if (!text) {
      return response(res, 400, "Текст комментария обязателен");
    }

    post.comments.push({ user: userId, text });

    await post.save();

    // 🔔 Уведомление владельцу поста о комментарии
    if (String(post.user) !== String(userId)) {
      await createNotificationAndEmit({
        user: post.user,
        actor: userId,
        type: "comment",
        entityType: "post",
        entityId: post._id,
        message: text.slice(0, 140),
      });
    }

    return response(res, 201, "Комментарий успешно добавлен", post);
  } catch (error) {
    console.error("❌ Ошибка в addCommentToPost:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Ответ на комментарий
 * ====================
 * POST /posts/comments/:postId/:commentId/reply
 */
const replyToComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user?.userId;

  const text =
    req.body && typeof req.body.text === "string" ? req.body.text.trim() : "";

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return response(res, 404, "Пост не найден");
    }

    if (!text) {
      return response(res, 400, "Текст ответа обязателен");
    }

    const parentComment = post.comments.id(commentId);

    if (!parentComment) {
      return response(res, 404, "Исходный комментарий не найден");
    }

    post.comments.push({
      user: userId,
      text,
      parentComment: parentComment._id,
    });

    await post.save();

    // 🔔 Уведомление автору исходного комментария
    if (String(parentComment.user) !== String(userId)) {
      await createNotificationAndEmit({
        user: parentComment.user,
        actor: userId,
        type: "comment",
        entityType: "comment",
        entityId: parentComment._id,
        message: text.slice(0, 140),
      });
    }

    return response(res, 201, "Ответ на комментарий успешно добавлен", post);
  } catch (error) {
    console.error("❌ Ошибка в replyToComment:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Лайк/анлайк комментария
 * =======================
 * POST /posts/comments/:postId/:commentId/like
 */
const likeComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user?.userId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return response(res, 404, "Пост не найден");
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return response(res, 404, "Комментарий не найден");
    }

    const hasLiked = comment.likes.some((id) => String(id) === String(userId));

    if (hasLiked) {
      comment.likes = comment.likes.filter(
        (id) => String(id) !== String(userId)
      );
    } else {
      comment.likes.push(userId);

      // 🔔 уведомление автору комментария
      if (String(comment.user) !== String(userId)) {
        await createNotificationAndEmit({
          user: comment.user,
          actor: userId,
          type: "like",
          entityType: "comment",
          entityId: comment._id,
        });
      }
    }

    await post.save();

    const isLiked = !hasLiked;

    return response(
      res,
      200,
      isLiked ? "Лайк на комментарий поставлен" : "Лайк на комментарий снят",
      {
        postId: post._id,
        commentId: comment._id,
        likeCount: comment.likes.length,
        isLiked,
      }
    );
  } catch (error) {
    console.error("❌ Ошибка в likeComment:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Репост
 * ======
 * POST /posts/share/:postId
 */
const sharePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user?.userId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return response(res, 404, "Пост не найден");
    }

    const hasUserShared = post.shares.some(
      (id) => String(id) === String(userId)
    );

    if (!hasUserShared) {
      post.shares.push(userId);

      // 🔔 уведомление владельцу поста о репосте
      if (String(post.user) !== String(userId)) {
        await createNotificationAndEmit({
          user: post.user,
          actor: userId,
          type: "repost",
          entityType: "post",
          entityId: post._id,
        });
      }
    }

    await post.save();

    return response(res, 200, "Пост успешно репостнут", {
      postId: post._id,
      shareCount: post.shareCount,
    });
  } catch (error) {
    console.error("❌ Ошибка в sharePost:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Удалить свой пост
 * =================
 * DELETE /posts/:postId
 */
const deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user?.userId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return response(res, 404, "Пост не найден");
    }

    if (String(post.user) !== String(userId)) {
      return response(
        res,
        403,
        "Вы можете удалять только свои собственные посты"
      );
    }

    await post.deleteOne();

    return response(res, 200, "Пост успешно удалён");
  } catch (error) {
    console.error("❌ Ошибка в deletePost:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Удалить свою сторис
 * ===================
 * DELETE /posts/story/:storyId
 */
const deleteStory = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user?.userId;

  try {
    const story = await Story.findById(storyId);

    if (!story) {
      return response(res, 404, "Сторис не найдена");
    }

    if (String(story.user) !== String(userId)) {
      return response(
        res,
        403,
        "Вы можете удалять только свои собственные сторис"
      );
    }

    story.isDeleted = true;
    await story.save();

    return response(res, 200, "Сторис успешно удалена");
  } catch (error) {
    console.error("❌ Ошибка в deleteStory:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Удалить комментарий к посту
 * ===========================
 * DELETE /posts/comments/:postId/:commentId
 */
const deleteCommentFromPost = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user?.userId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return response(res, 404, "Пост не найден");
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return response(res, 404, "Комментарий не найден");
    }

    if (String(comment.user) !== String(userId)) {
      return response(
        res,
        403,
        "Вы можете удалять только свои собственные комментарии"
      );
    }

    comment.deleteOne();
    await post.save();

    return response(res, 200, "Комментарий успешно удалён", post);
  } catch (error) {
    console.error("❌ Ошибка в deleteCommentFromPost:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostByUserId,
  likePost,
  addCommentToPost,
  replyToComment,
  likeComment,
  sharePost,
  createStory,
  getAllStory,
  getVideoPosts,
  deletePost,
  deleteStory,
  deleteCommentFromPost,
};
