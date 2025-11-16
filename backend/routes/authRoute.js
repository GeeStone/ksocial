// backend/routes/authRoute.js
// ===========================
// Маршруты для регистрации, логина, logout и Google OAuth

const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logout,
  getCookieOptions,
} = require("../controllers/authController");

const passport = require("../controllers/googleController");
const { generateToken } = require("../utils/generateToken");

// === ROUTES ===========================================================

// Регистрация
router.post("/register", registerUser);

// Логин
router.post("/login", loginUser);

// Logout
router.get("/logout", logout);

// ================== GOOGLE OAUTH =====================================

// Запрос авторизации через Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Callback от Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/user-login`,
  }),
  (req, res) => {
    // Если аутентификация прошла успешно - выдаём токен
    const accessToken = generateToken(req.user);

    // Записываем токен в httpOnly cookie
    res.cookie("auth_token", accessToken, getCookieOptions());

    // Перенаправляем пользователя на фронтенд
    res.redirect(process.env.FRONTEND_URL);
  }
);

module.exports = router;
