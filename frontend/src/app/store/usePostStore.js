// src/app/store/usePostStore.js
"use client";

import {
  commentsPost,
  createPost,
  createStory,
  deleteComment,
  deletePost,
  deleteStory,
  getAllPosts,
  getAllStory,
  getAllUserPosts,
  getVideoPosts,
  likeComment,
  likePost, // 👈 лайк комментария
  sharePost,
} from "@/service/post.service";
import toast from "react-hot-toast";
import { create } from "zustand";

export const usePostStore = create((set, get) => ({
  posts: [], // общая лента
  userPosts: [], // посты конкретного пользователя (страница профиля)
  story: [], // сторис
  videoPosts: [], // отдельная лента видеопостов
  loading: false,
  error: null,

  // ================== ПОЛУЧЕНИЕ ДАННЫХ ==================

  // Получить все посты
  fetchPost: async () => {
    set({ loading: true, error: null });
    try {
      const posts = await getAllPosts();
      set({ posts: posts || [], loading: false });
    } catch (error) {
      console.error("fetchPost error:", error);
      set({ error, loading: false });
    }
  },

  // Получить посты пользователя
  fetchUserPost: async (userId) => {
    set({ loading: true, error: null });
    try {
      const userPosts = await getAllUserPosts(userId);
      set({ userPosts: userPosts || [], loading: false });
    } catch (error) {
      console.error("fetchUserPost error:", error);
      set({ error, loading: false });
    }
  },

  // Получить все сторис
  fetchStoryPost: async () => {
    set({ loading: true, error: null });
    try {
      const story = await getAllStory();
      set({ story: story || [], loading: false });
    } catch (error) {
      console.error("fetchStoryPost error:", error);
      set({ error, loading: false });
    }
  },

  // Получить ленту видеозаписей
  fetchVideoPosts: async () => {
    set({ loading: true, error: null });
    try {
      const videoPosts = await getVideoPosts();
      set({ videoPosts: videoPosts || [], loading: false });
    } catch (error) {
      console.error("fetchVideoPosts error:", error);
      set({ error, loading: false });
    }
  },

  // ================== СОЗДАНИЕ ==================

  // Создать пост
  handleCreatePost: async (postData /* FormData */) => {
    set({ loading: true, error: null });
    try {
      const newPost = await createPost(postData);

      set((state) => ({
        // общая лента
        posts: newPost ? [newPost, ...(state.posts || [])] : state.posts,

        // лента на странице профиля
        userPosts: newPost
          ? [newPost, ...(state.userPosts || [])]
          : state.userPosts,

        loading: false,
      }));

      toast.success("Пост успешно создан");
    } catch (error) {
      console.error("handleCreatePost error:", error);
      set({ error, loading: false });
      toast.error("Не удалось создать пост");
    }
  },
  // Создать сторис
  handleCreateStory: async (storyData /* FormData */) => {
    set({ loading: true, error: null });
    try {
      const newStory = await createStory(storyData);
      set((state) => ({
        story: newStory ? [newStory, ...(state.story || [])] : state.story,
        loading: false,
      }));
      toast.success("Сторис успешно создана");
    } catch (error) {
      console.error("handleCreateStory error:", error);
      set({ error, loading: false });
      toast.error("Не удалось создать сторис");
    }
  },

  // ================== РЕАКЦИИ (ЛАЙК/КОММЕНТ/РЕПОСТ) ==================

  // Лайк/анлайк поста
  handleLikePost: async (postId) => {
    try {
      // бэк вернёт: { postId, likeCount, isLiked }
      const data = await likePost(postId);
      if (!data) return;

      const { postId: updatedId, likeCount, isLiked } = data;

      set((state) => ({
        posts: (state.posts || []).map((p) =>
          p?._id === updatedId
            ? {
                ...p,
                likeCount,
                hasLiked: isLiked,
              }
            : p
        ),
        userPosts: (state.userPosts || []).map((p) =>
          p?._id === updatedId
            ? {
                ...p,
                likeCount,
                hasLiked: isLiked,
              }
            : p
        ),
      }));
    } catch (error) {
      console.error("handleLikePost error:", error);
      set({ error });
    }
  },

  // Добавить комментарий
  handleCommentPost: async (postId, text) => {
    set({ loading: true, error: null });
    try {
      const updatedPost = await commentsPost(postId, { text });
      set((state) => ({
        posts: (state.posts || []).map((post) =>
          post?._id === postId ? updatedPost : post
        ),
        userPosts: (state.userPosts || []).map((post) =>
          post?._id === postId ? updatedPost : post
        ),
        loading: false,
      }));
      toast.success("Комментарий добавлен");
    } catch (error) {
      console.error("handleCommentPost error:", error);
      set({ error, loading: false });
      toast.error("Не удалось добавить комментарий");
    }
  },

  // Удалить комментарий
  handleDeleteCommentPost: async (postId, commentId) => {
    set({ loading: true, error: null });

    try {
      const updatedPost = await deleteComment(postId, commentId);

      set((state) => ({
        posts: (state.posts || []).map((post) =>
          post?._id === postId ? updatedPost : post
        ),
        userPosts: (state.userPosts || []).map((post) =>
          post?._id === postId ? updatedPost : post
        ),
        loading: false,
      }));

      toast.success("Комментарий удалён");
    } catch (error) {
      console.error("handleDeleteCommentPost error:", error);
      set({ error, loading: false });
      toast.error("Не удалось удалить комментарий");
    }
  },

  // 👍 Лайк/анлайк комментария
  handleLikeCommentPost: async (postId, commentId) => {
    if (!postId || !commentId) return;

    try {
      // бэк: { postId, commentId, likeCount, isLiked }
      const data = await likeComment(postId, commentId);
      if (!data) return;

      const {
        postId: updatedPostId,
        commentId: updatedCommentId,
        likeCount,
        isLiked,
      } = data;

      const updatePostComments = (posts = []) =>
        posts.map((post) => {
          if (post?._id !== updatedPostId) return post;
          return {
            ...post,
            comments: (post.comments || []).map((c) =>
              c._id === updatedCommentId
                ? {
                    ...c,
                    likeCount,
                    isLiked,
                  }
                : c
            ),
          };
        });

      set((state) => ({
        posts: updatePostComments(state.posts),
        userPosts: updatePostComments(state.userPosts),
      }));
    } catch (error) {
      console.error("handleLikeCommentPost error:", error);
      set({ error });
      toast.error("Не удалось поставить лайк комментарию");
    }
  },

  // 🔁 Репост (добавить пост себе, обновить shareCount)
  handleSharePost: async (postId) => {
    set({ loading: true, error: null });
    try {
      // бэк: { postId, shareCount }
      const data = await sharePost(postId);
      const { postId: updatedId, shareCount } = data || {};

      const updateShares = (posts = []) =>
        posts.map((post) =>
          post?._id === updatedId ? { ...post, shareCount } : post
        );

      set((state) => ({
        posts: updateShares(state.posts),
        userPosts: updateShares(state.userPosts),
        loading: false,
      }));

      toast.success("Пост добавлен себе");
    } catch (error) {
      console.error("handleSharePost error:", error);
      set({ error, loading: false });
      toast.error("Не удалось репостнуть пост");
    }
  },

  // ================== УДАЛЕНИЕ ПОСТОВ / СТОРИС ==================

  // Удалить пост
  handleDeletePost: async (postId) => {
    set({ loading: true, error: null });
    try {
      await deletePost(postId);
      set((state) => ({
        posts: (state.posts || []).filter((p) => p?._id !== postId),
        userPosts: (state.userPosts || []).filter((p) => p?._id !== postId),
        loading: false,
      }));
      toast.success("Пост удалён");
    } catch (error) {
      console.error("handleDeletePost error:", error);
      set({ error, loading: false });
      toast.error("Не удалось удалить пост");
    }
  },

  // Удалить сторис
  handleDeleteStory: async (storyId) => {
    set({ loading: true, error: null });
    try {
      await deleteStory(storyId);
      set((state) => ({
        story: (state.story || []).filter((s) => s?._id !== storyId),
        loading: false,
      }));
      toast.success("Сторис удалена");
    } catch (error) {
      console.error("handleDeleteStory error:", error);
      set({ error, loading: false });
      toast.error("Не удалось удалить сторис");
    }
  },
}));
