// backend/utils/generateToken.js
// ===============================
// Утилита для генерации JWT-токена по данным пользователя
const jwt = require("jsonwebtoken");

/**
 * Генерация access-токена для пользователя
 * @param {Object} user - документ пользователя из MongoDB
 * @return {string} JWT-токен
 */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Не задан JWT_SECRET в .env");
  }

  // Минимальный набор данных, который кладём в токен
  const payload = {
    userId: user?._id,
    email: user.email,
  };

  // ExpiresIn можно потом вынести в .env, если будет нужно
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

module.exports = { generateToken };
