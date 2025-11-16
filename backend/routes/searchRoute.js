// backend/routes/searchRoute.js
// =============================
// Маршруты для поиска пользователей и постов

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { searchUsers, searchPosts } = require("../controllers/searchController");

// Поиск пользователей
// GET /search/users?q=...
router.get("/users", authMiddleware, searchUsers);

// Поиск постов
// GET /search/posts?q=...
router.get("/posts", authMiddleware, searchPosts);

module.exports = router;
