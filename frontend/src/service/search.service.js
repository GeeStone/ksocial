// === src/service/search.service.js ===
// Сервисы для поиска пользователей и постов

import axiosInstance from "./url.service";

/**
 * 🔍 Поиск пользователей по имени или email
 *
 * @param {string} query - строка поиска
 */
export const searchUsers = async (query) => {
  try {
    const result = await axiosInstance.get(
      `/search/users?q=${encodeURIComponent(query)}`
    );
    return result?.data?.data;
  } catch (error) {
    console.error("🔴 Ошибка при поиске пользователей (searchUsers):", error);
    throw error;
  }
};

/**
 * 🔍 Поиск постов по содержимому
 *
 * @param {string} query - строка поиска
 */
export const searchPosts = async (query) => {
  try {
    const result = await axiosInstance.get(
      `/search/posts?q=${encodeURIComponent(query)}`
    );
    return result?.data?.data;
  } catch (error) {
    console.error("🔴 Ошибка при поиске постов (searchPosts):", error);
    throw error;
  }
};
