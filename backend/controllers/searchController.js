// backend/controllers/searchController.js
// =======================================
// Поиск пользователей и постов

const User = require("../model/User");
const Post = require("../model/Post");
const response = require("../utils/responseHandler");

/**
 * Поиск пользователей по имени / email
 * ====================================
 * GET /search/users?q=...
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return response(res, 400, "Параметр q обязателен");
    }

    const regex = new RegExp(q.trim(), "i");

    const users = await User.find({
      $or: [{ username: regex }, { email: regex }],
    }).select("username profilePicture email followerCount");

    return response(res, 200, "Пользователи успешно найдены", users);
  } catch (error) {
    console.error("❌ Ошибка в searchUsers:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Поиск постов по тексту
 * ======================
 * GET /search/posts?q=...
 */
const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return response(res, 400, "Параметр q обязателен");
    }

    const regex = new RegExp(q.trim(), "i");

    const posts = await Post.find({
      content: regex,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("user", "_id username profilePicture");

    return response(res, 200, "Посты успешно найдены", posts);
  } catch (error) {
    console.error("❌ Ошибка в searchPosts:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

module.exports = {
  searchUsers,
  searchPosts,
};
