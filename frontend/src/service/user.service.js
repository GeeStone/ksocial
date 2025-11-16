// === src/service/user.service.js ===
// Сервисы для работы с пользователями, подписками, заявками, профилем и BIO

import axiosInstance from "./url.service";

/* -------------------------------------------------------------------------- */
/*                              ПОДПИСКИ / ДРУЗЬЯ                             */
/* -------------------------------------------------------------------------- */

/**
 * 🤝 Подписаться на пользователя
 * Бэкенд: POST /users/follow
 */
export const followUser = async (userIdToFollow) => {
  try {
    const result = await axiosInstance.post("/users/follow", {
      userIdToFollow,
    });
    return result?.data?.data;
  } catch (error) {
    console.error("🔴 Ошибка при подписке (followUser):", error);
    throw error;
  }
};

/**
 * 🙅‍♂️ Отписаться от пользователя
 * Бэкенд: POST /users/unfollow
 */
export const unfollowUser = async (userIdToUnfollow) => {
  try {
    const result = await axiosInstance.post("/users/unfollow", {
      userIdToUnfollow,
    });
    return result?.data?.data;
  } catch (error) {
    console.error("🔴 Ошибка при отписке (unfollowUser):", error);
    throw error;
  }
};

/**
 * 🗑 Удалить входящую «заявку в друзья»
 * Бэкенд: POST /users/friend-request/remove
 */
export const deleteUserFromRequest = async (requestSenderId) => {
  try {
    const result = await axiosInstance.post("/users/friend-request/remove", {
      requestSenderId,
    });
    return result?.data?.data;
  } catch (error) {
    console.error(
      "🔴 Ошибка при удалении заявки в друзья (deleteUserFromRequest):",
      error
    );
    throw error;
  }
};

/**
 * 📥 Получить входящие заявки (кто подписан на меня, а я — нет)
 * Бэкенд: GET /users/friend-request
 */
export const getAllFriendsRequest = async () => {
  try {
    const result = await axiosInstance.get("/users/friend-request");
    return result?.data?.data;
  } catch (error) {
    console.error(
      "🔴 Ошибка при получении входящих заявок (getAllFriendsRequest):",
      error
    );
    throw error;
  }
};

/**
 * 🧩 Пользователи без связи (ни я на них, ни они на меня)
 * Бэкенд: GET /users/user-to-request
 */
export const getAllUserForRequest = async () => {
  try {
    const result = await axiosInstance.get("/users/user-to-request");
    return result?.data?.data;
  } catch (error) {
    console.error(
      "🔴 Ошибка при получении пользователей без связи (getAllUserForRequest):",
      error
    );
    throw error;
  }
};

/**
 * 👥 Общие друзья между мной и другим пользователем
 * Бэкенд: GET /users/mutual-friends?userIdToFollow=...
 */
export const getAllMutualFriends = async (userIdToFollow) => {
  try {
    const result = await axiosInstance.get(
      `/users/mutual-friends?userIdToFollow=${userIdToFollow}`
    );
    return result?.data?.data;
  } catch (error) {
    console.error(
      "🔴 Ошибка при получении общих друзей (getAllMutualFriends):",
      error
    );
    throw error;
  }
};

/**
 * 📋 Получить всех пользователей (кроме текущего)
 * Бэкенд: GET /users
 */
export const getAllUsers = async () => {
  try {
    const result = await axiosInstance.get("/users");
    return result?.data?.data;
  } catch (error) {
    console.error(
      "🔴 Ошибка при получении пользователей (getAllUsers):",
      error
    );
    throw error;
  }
};

/**
 * 👥 Получить список моих друзей (взаимные подписки)
 * Бэкенд: GET /users/friends
 */
export const getUserFriends = async () => {
  try {
    const result = await axiosInstance.get("/users/friends");
    return result?.data?.data;
  } catch (error) {
    console.error("🔴 Ошибка при получении друзей (getUserFriends):", error);
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*                             ПРОФИЛЬ / BIO / AVАТАР                         */
/* -------------------------------------------------------------------------- */

/**
 * 👤 Получить профиль пользователя по ID
 * Бэкенд: GET /users/profile/:userId
 *
 * Возвращает:
 * {
 *   profile: User,
 *   isOwner: boolean
 * }
 */
export const getUserProfile = async (userId) => {
  try {
    const result = await axiosInstance.get(`/users/profile/${userId}`);
    return result?.data?.data;
  } catch (error) {
    console.error("🔴 Ошибка при получении профиля (getUserProfile):", error);
    throw error;
  }
};

/**
 * 📝 Обновить или создать BIO пользователя
 * Бэкенд: PUT /users/bio/:userId
 */
export const updateUserBio = async (userId, bioData) => {
  try {
    const result = await axiosInstance.put(`/users/bio/${userId}`, bioData);
    return result?.data?.data;
  } catch (error) {
    console.error("🔴 Ошибка при обновлении BIO (updateUserBio):", error);
    throw error;
  }
};

/**
 * 🧑 Обновить профиль пользователя (имя, пол, дата рождения, аватар)
 *
 * Ожидается FormData:
 *  - username?: string
 *  - gender?: string
 *  - dateOfBirth?: string (ISO / yyyy-mm-dd)
 *  - profilePicture?: File
 *
 * Бэкенд: PUT /users/profile/:userId
 */
export const updateUserProfile = async (userId, formData) => {
  try {
    const result = await axiosInstance.put(
      `/users/profile/${userId}`,
      formData
    );
    return result?.data?.data;
  } catch (error) {
    console.error(
      "🔴 Ошибка при обновлении профиля (updateUserProfile):",
      error
    );
    throw error;
  }
};

/**
 * 🖼 Обновить обложку профиля (coverPhoto)
 *
 * Ожидается FormData:
 *  - coverPhoto: File
 *
 * Бэкенд: PUT /users/profile/cover-photo/:userId
 */
export const updateCoverPhoto = async (userId, formData) => {
  try {
    const result = await axiosInstance.put(
      `/users/profile/cover-photo/${userId}`,
      formData
    );
    return result?.data?.data;
  } catch (error) {
    console.error(
      "🔴 Ошибка при обновлении обложки (updateCoverPhoto):",
      error
    );
    throw error;
  }
};
