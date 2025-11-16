// backend/middleware/authMiddleware.js
// ====================================
// Middleware для проверки JWT-токена и получения данных пользователя

const jwt = require("jsonwebtoken");
const response = require("../utils/responseHandler");

/**
 * Middleware для защищённых роутов.
 * 1. Извлекает токен из куки (auth_token) или из заголовка Authorization.
 * 2. Проверяет подпись JWT.
 * 3. Кладёт в req.user расшифрованные данные (userId, email).
 * 4. ОБЯЗАТЕЛЬНО вызывает next(), если всё ок.
 */
const authMiddleware = (req, res, next) => {
  try {
    // 1. Пробуем взять токен из cookie
    let token = req?.cookies?.auth_token;

    // 2. Если нет в cookie - пробуем из заголовка Authorization: Bearer <token>
    if (!token && req.headers.authorization) {
      const [type, value] = req.headers.authorization.split(" ");
      if (type === "Bearer" && value) {
        token = value;
      }
    }

    // Если токена нет ни там, ни там - возвращаем 401
    if (!token) {
      return response(
        res,
        401,
        "Требуется аутентификация. Пожалуйста, выполните вход."
      );
    }

    // Проверка и расшифровка JWT (через callback, чтобы точно поймать ошибки)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err || !decoded) {
        console.error("❌ JWT verify error:", err?.message || "no payload");
        return response(
          res,
          401,
          "Неверный или просроченный токен. Пожалуйста, войдите снова."
        );
      }

      // Кладём в req.user полезные данные
      req.user = {
        userId: decoded.userId || decoded.id || decoded._id,
        email: decoded.email,
      };

      // ✨ ВАЖНО: передаём управление дальше
      return next();
    });
  } catch (error) {
    console.error("❌ Ошибка в authMiddleware:", error.message);
    return response(
      res,
      401,
      "Ошибка аутентификации. Пожалуйста, войдите снова."
    );
  }
};

module.exports = authMiddleware;
