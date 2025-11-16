// === src/service/auth.service.js ===
// Сервисы авторизации: регистрация, вход, выход и проверка текущей сессии

import axiosInstance from "./url.service";

/**
 * 📌 Регистрация пользователя
 *
 * @param {Object} userData - данные формы регистрации
 * @returns {Promise<Object|null>} - объект ответа бэкенда или null, если статус не success
 */
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);

    if (response?.data?.status === "success") {
      // { status, code, message, data }
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("🔴 Ошибка при регистрации (registerUser):", error);
    throw error;
  }
};

/**
 * 🔑 Вход пользователя (логин)
 *
 * @param {Object} userData - данные формы логина (email, password)
 * @returns {Promise<Object|null>} - объект ответа бэкенда или null, если статус не success
 */
export const loginUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/login", userData);

    if (response?.data?.status === "success") {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("🔴 Ошибка при входе (loginUser):", error);
    throw error;
  }
};

/**
 * 🚪 Выход пользователя из системы
 *
 * @returns {Promise<Object|null>} - ответ бэкенда или null в случае ошибки
 */
export const logout = async () => {
  try {
    const response = await axiosInstance.get("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("🔴 Ошибка при выходе (logout):", error);
    // Не пробрасываем ошибку, чтобы не ломать обёртки авторизации
    return null;
  }
};

/**
 * ✅ Проверка, авторизован ли текущий пользователь
 *
 * @returns {Promise<{isAuthenticated: boolean, user?: Object}>}
 */
export const checkUserAuth = async () => {
  try {
    const response = await axiosInstance.get("/users/check-auth");

    if (response?.data?.status === "success") {
      return {
        isAuthenticated: true,
        user: response.data.data,
      };
    }

    return { isAuthenticated: false };
  } catch (error) {
    console.error("🔴 Ошибка при проверке авторизации (checkUserAuth):", error);
    return { isAuthenticated: false };
  }
};
