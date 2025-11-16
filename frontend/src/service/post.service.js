// src/service/post.service.js
import axiosInstance from "./url.service";

/**
 * Создать пост (текст и/или медиа)
 * Ожидается либо FormData, либо обычный объект.
 * Если передаёшь файл, используй FormData и поле "media".
 */
export const createPost = async (postData) => {
  try {
    const result = await axiosInstance.post("/posts", postData);
    return result?.data?.data;
  } catch (error) {
    console.error("createPost error:", error);
    throw error;
  }
};

/**
 * Создать сторис
 * Ожидается FormData с полем "media"
 */
export const createStory = async (storyData) => {
  try {
    const result = await axiosInstance.post("/posts/story", storyData);
    return result?.data?.data;
  } catch (error) {
    console.error("createStory error:", error);
    throw error;
  }
};

/**
 * Получить все посты (общая лента)
 */
export const getAllPosts = async () => {
  try {
    const result = await axiosInstance.get("/posts");
    return result?.data?.data;
  } catch (error) {
    console.error("getAllPosts error:", error);
    throw error;
  }
};

/**
 * Получить все сторис
 */
export const getAllStory = async () => {
  try {
    const result = await axiosInstance.get("/posts/story");
    return result?.data?.data;
  } catch (error) {
    console.error("getAllStory error:", error);
    throw error;
  }
};

/**
 * Лента видеозаписей (посты с mediaType = "video")
 */
export const getVideoPosts = async () => {
  try {
    const result = await axiosInstance.get("/posts/videos");
    return result?.data?.data;
  } catch (error) {
    console.error("getVideoPosts error:", error);
    throw error;
  }
};

/**
 * Лайк/анлайк поста
 * Бэк возвращает:
 *  { postId, likeCount, isLiked }
 */
export const likePost = async (postId) => {
  try {
    const result = await axiosInstance.post(`/posts/likes/${postId}`);
    return result?.data?.data;
  } catch (error) {
    console.error("likePost error:", error);
    throw error;
  }
};

/**
 * Добавить комментарий к посту (корневой комментарий)
 * comments = { text: "..." }
 */
export const commentsPost = async (postId, comments) => {
  try {
    const result = await axiosInstance.post(
      `/posts/comments/${postId}`,
      comments
    );
    return result?.data?.data;
  } catch (error) {
    console.error("commentsPost error:", error);
    throw error;
  }
};

/**
 * Ответ на комментарий
 * body = { text: "..." }
 */
export const replyComment = async (postId, commentId, body) => {
  try {
    const result = await axiosInstance.post(
      `/posts/comments/${postId}/${commentId}/reply`,
      body
    );
    return result?.data?.data;
  } catch (error) {
    console.error("replyComment error:", error);
    throw error;
  }
};

/**
 * Лайк/анлайк комментария
 */
export const likeComment = async (postId, commentId) => {
  try {
    const result = await axiosInstance.post(
      `/posts/comments/${postId}/${commentId}/like`
    );
    return result?.data?.data;
  } catch (error) {
    console.error("likeComment error:", error);
    throw error;
  }
};

/**
 * Репост поста
 */
export const sharePost = async (postId) => {
  try {
    const result = await axiosInstance.post(`/posts/share/${postId}`);
    return result?.data?.data;
  } catch (error) {
    console.error("sharePost error:", error);
    throw error;
  }
};

/**
 * Посты конкретного пользователя
 */
export const getAllUserPosts = async (userId) => {
  try {
    const result = await axiosInstance.get(`/posts/user/${userId}`);
    return result?.data?.data;
  } catch (error) {
    console.error("getAllUserPosts error:", error);
    throw error;
  }
};

/**
 * Удалить свой пост
 */
export const deletePost = async (postId) => {
  try {
    const result = await axiosInstance.delete(`/posts/${postId}`);
    return result?.data?.data;
  } catch (error) {
    console.error("deletePost error:", error);
    throw error;
  }
};

/**
 * Удалить свою сторис
 */
export const deleteStory = async (storyId) => {
  try {
    const result = await axiosInstance.delete(`/posts/story/${storyId}`);
    return result?.data?.data;
  } catch (error) {
    console.error("deleteStory error:", error);
    throw error;
  }
};

/**
 * Удалить комментарий к посту
 */
export const deleteComment = async (postId, commentId) => {
  try {
    const result = await axiosInstance.delete(
      `/posts/comments/${postId}/${commentId}`
    );
    return result?.data?.data;
  } catch (error) {
    console.error("deleteComment error:", error);
    throw error;
  }
};
