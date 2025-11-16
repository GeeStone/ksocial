// backend/routes/userRoute.js
// ===========================
// Маршруты для:
// - подписок
// - отписок
// - входящих заявок
// - рекомендаций пользователей
// - mutual friends
// - профиля
// - био
// - обновления аватара / обложки

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  followUser,
  unfollowUser,
  deleteUserFromRequest,
  getAllFriendsRequest,
  getAllUserForRequest,
  getAllMutualFriends,
  getAllUser,
  getUserProfile,
  checkUserAuth,
  getUserFriends,
} = require("../controllers/userController");

const {
  createOrUpdateUserBio,
  updateUserProfile,
  updateCoverPhoto,
} = require("../controllers/createOrUpdateController");

const { multerMiddleware } = require("../config/storage");

// ===================== FOLLOWING ======================================

// Подписаться
router.post("/follow", authMiddleware, followUser);

// Отписаться
router.post("/unfollow", authMiddleware, unfollowUser);

// Удалить входящую заявку
router.post("/friend-request/remove", authMiddleware, deleteUserFromRequest);

// Получить список входящих заявок (кто подписан на меня, а я — нет)
router.get("/friend-request", authMiddleware, getAllFriendsRequest);

// Список людей для новой подписки (ни подписчиков, ни подписок)
router.get("/user-to-request", authMiddleware, getAllUserForRequest);

// Общие друзья
router.get("/mutual-friends", authMiddleware, getAllMutualFriends);

// 👥 Мои друзья (взаимные подписки)
router.get("/friends", authMiddleware, getUserFriends);

// ===================== USERS ==========================================

// Список всех пользователей (кроме меня)
router.get("/", authMiddleware, getAllUser);

// Профиль пользователя
router.get("/profile/:userId", authMiddleware, getUserProfile);

// Проверка авторизации
router.get("/check-auth", authMiddleware, checkUserAuth);

// ===================== BIO & PROFILE =================================

// Обновить или создать BIO
router.put("/bio/:userId", authMiddleware, createOrUpdateUserBio);

// Обновить профиль (аватар, имя, пол, дата рождения)
router.put(
  "/profile/:userId",
  authMiddleware,
  multerMiddleware.single("profilePicture"),
  updateUserProfile
);

// Обновить обложку
router.put(
  "/profile/cover-photo/:userId",
  authMiddleware,
  multerMiddleware.single("coverPhoto"),
  updateCoverPhoto
);

module.exports = router;
