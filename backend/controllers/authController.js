// backend/controllers/authController.js
// =====================================
// Регистрация, логин и выход пользователя через обычный email/пароль

const bcrypt = require("bcryptjs");
const User = require("../model/User");
const { generateToken } = require("../utils/generateToken");
const response = require("../utils/responseHandler");

// Общие настройки для cookies с токеном
// В DEV (localhost) — SameSite=Lax, без secure
// В PROD (домен + https) — SameSite=None, secure=true (для кросс-доменных cookie)
const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true, // Кука недоступна из JS на фронте
    secure: isProd, // Только HTTPS в проде
    sameSite: isProd ? "none" : "lax", // В dev проще жить с lax
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 дней
  };
};

/**
 * POST /auth/register
 * ====================
 * Регистрация нового пользователя
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password, gender, dateOfBirth } = req.body;

    // Базовая валидация
    if (!username || !email || !password) {
      return response(res, 400, "Имя, email и пароль обязательны");
    }

    // Проверяем, не занят ли email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response(res, 400, "Пользователь с таким email уже существует");
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём пользователя
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
    });

    await newUser.save();

    // Генерируем JWT-токен
    const accessToken = generateToken(newUser);

    // Ставим токен в httpOnly cookie
    res.cookie("auth_token", accessToken, getCookieOptions());

    return response(res, 201, "Пользователь успешно создан", {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      profilePicture: newUser.profilePicture,
    });
  } catch (error) {
    console.error("❌ Ошибка в registerUser:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * POST /auth/login
 * ====================
 * Вход пользователя по email и паролю
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return response(res, 400, "Email и пароль обязательны");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return response(res, 404, "Пользователь с таким email не найден");
    }

    if (!user.password) {
      // Это, например, аккаунт только через Google OAuth
      return response(
        res,
        400,
        "Этот аккаунт использует вход через Google. Попробуйте войти через Google."
      );
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return response(res, 401, "Неверный пароль");
    }

    const accessToken = generateToken(user);
    res.cookie("auth_token", accessToken, getCookieOptions());

    return response(res, 200, "Успешный вход", {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("❌ Ошибка в loginUser:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * GET /auth/logout
 * =================
 * Выход пользователя - просто очищаем cookie с токеном
 */
const logout = (req, res) => {
  try {
    res.cookie("auth_token", "", {
      ...getCookieOptions(),
      expires: new Date(0), // Моментально протухает
      maxAge: 0,
    });

    return response(res, 200, "Пользователь успешно вышел из системы");
  } catch (error) {
    console.error("❌ Ошибка в logout:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

module.exports = { registerUser, loginUser, logout, getCookieOptions };
