"use client";

import {
  deleteUserFromRequest,
  followUser,
  getAllFriendsRequest,
  getAllUserForRequest,
  getAllUsers,
  getUserFriends,
  unfollowUser,
} from "@/service/user.service";
import { create } from "zustand";

const useFriendsStore = create((set, get) => ({
  // данные
  incomingRequests: [], // входящие заявки
  suggestions: [], // "кого добавить"
  allUsers: [], // все пользователи (кроме меня)
  friends: [], // ✅ мои друзья (взаимные подписки)
  loading: false,
  error: null,

  /* ================== ЗАГРУЗКА ДАННЫХ ================== */

  // входящие заявки
  async fetchIncomingRequests() {
    try {
      const data = await getAllFriendsRequest();
      const incoming = Array.isArray(data) ? data : data?.requests || [];
      set({ incomingRequests: incoming });
    } catch (e) {
      console.error("fetchIncomingRequests error:", e);
    }
  },

  // рекомендации "Кого добавить"
  async fetchSuggestions() {
    try {
      const data = await getAllUserForRequest();
      const suggestions = Array.isArray(data) ? data : data?.users || [];
      set({ suggestions });
    } catch (e) {
      console.error("fetchSuggestions error:", e);
    }
  },

  // все пользователи
  async fetchAllUsers() {
    try {
      set({ loading: true, error: null });
      const data = await getAllUsers();
      const users = Array.isArray(data) ? data : data?.users || [];
      set({ allUsers: users, loading: false });
    } catch (e) {
      console.error("fetchAllUsers error:", e);
      set({
        loading: false,
        error: "Не удалось загрузить пользователей",
      });
    }
  },

  // ✅ мои друзья (отдельный список)
  async fetchFriends() {
    try {
      const data = await getUserFriends();
      const friends = Array.isArray(data) ? data : data?.friends || [];
      set({ friends });
    } catch (e) {
      console.error("fetchFriends error:", e);
    }
  },

  /* ================== ДЕЙСТВИЯ ================== */

  // подписаться / принять заявку
  async follow(userIdToFollow) {
    if (!userIdToFollow) return;
    try {
      await followUser(userIdToFollow);
    } catch (e) {
      console.error("follow error:", e);
    } finally {
      // обновляем связанные списки
      const {
        fetchIncomingRequests,
        fetchSuggestions,
        fetchFriends,
        fetchAllUsers,
      } = get();

      fetchIncomingRequests();
      fetchSuggestions();
      fetchFriends?.();
      fetchAllUsers();
    }
  },

  // отписаться / удалить из друзей
  async unfollow(userIdToUnfollow) {
    if (!userIdToUnfollow) return;
    try {
      await unfollowUser(userIdToUnfollow);
    } catch (e) {
      console.error("unfollow error:", e);
    } finally {
      const { fetchFriends, fetchSuggestions } = get();
      fetchFriends?.();
      fetchSuggestions();
    }
  },

  // удалить входящую заявку
  async removeIncomingRequest(requestSenderId) {
    if (!requestSenderId) return;

    try {
      await deleteUserFromRequest(requestSenderId);

      const current = get().incomingRequests;
      set({
        incomingRequests: current.filter(
          (u) => String(u._id) !== String(requestSenderId)
        ),
      });
    } catch (e) {
      console.error("removeIncomingRequest error:", e);
    }
  },
}));

export default useFriendsStore;
