// === src/app/store/useProfileStore.js ===
"use client";

import {
  getUserProfile,
  updateCoverPhoto,
  updateUserBio,
  updateUserProfile,
} from "@/service/user.service";
import toast from "react-hot-toast";
import { create } from "zustand";

/**
 * Стор для страницы профиля (любой пользователь).
 *
 * Отличие от useUserStore:
 *  - useUserStore  — отвечает за текущего авторизованного пользователя (сессия)
 *  - useProfileStore — отвечает за ПРОСМАТРИВАЕМЫЙ профиль (свой или чужой)
 */

const useProfileStore = create((set) => ({
  // Текущий профиль, который открыт на странице
  profile: null, // объект пользователя с bio
  // Флаг: является ли текущий просмотренный профиль профилем залогиненного пользователя
  isOwner: false,

  // Общие флаги состояния
  loading: false,
  error: null,

  /**
   * 🔄 Загрузить профиль по userId.
   * Обычно вызывается в useEffect в компоненте /user-profile.
   *
   * @param {string} userId
   */
  fetchProfile: async (userId) => {
    if (!userId) return;

    set({ loading: true, error: null });

    try {
      const result = await getUserProfile(userId);
      // Бэкенд возвращает { profile, isOwner }
      set({
        profile: result?.profile || null,
        isOwner: !!result?.isOwner,
        loading: false,
      });
    } catch (error) {
      console.error("🔴 Ошибка при загрузке профиля (fetchProfile):", error);
      set({ error, loading: false });
      toast.error("Не удалось загрузить профиль пользователя");
    }
  },

  /**
   * 💾 Обновить основные данные профиля + аватар.
   *
   * formData (FormData):
   *  - username?: string
   *  - gender?: string
   *  - dateOfBirth?: string (формат yyyy-mm-dd / ISO)
   *  - profilePicture?: File
   *
   * @param {string} userId
   * @param {FormData} formData
   */
  saveProfile: async (userId, formData) => {
    if (!userId) return;

    set({ loading: true, error: null });

    try {
      const updatedUser = await updateUserProfile(userId, formData);

      // Обновляем только те поля, которые пришли с бэка
      set((state) => ({
        profile: state.profile
          ? {
              ...state.profile,
              ...updatedUser,
            }
          : updatedUser,
        loading: false,
      }));

      toast.success("Профиль успешно обновлён");
    } catch (error) {
      console.error("🔴 Ошибка при обновлении профиля (saveProfile):", error);
      set({ error, loading: false });
      toast.error("Не удалось обновить профиль");
    }
  },

  /**
   * 🖼 Обновить обложку профиля (coverPhoto).
   *
   * formData (FormData):
   *  - coverPhoto: File
   *
   * @param {string} userId
   * @param {FormData} formData
   */
  saveCoverPhoto: async (userId, formData) => {
    if (!userId) return;

    set({ loading: true, error: null });

    try {
      const updatedUser = await updateCoverPhoto(userId, formData);

      set((state) => ({
        profile: state.profile
          ? {
              ...state.profile,
              coverPhoto: updatedUser?.coverPhoto || state.profile.coverPhoto,
            }
          : updatedUser,
        loading: false,
      }));

      toast.success("Обложка профиля обновлена");
    } catch (error) {
      console.error(
        "🔴 Ошибка при обновлении обложки профиля (saveCoverPhoto):",
        error
      );
      set({ error, loading: false });
      toast.error("Не удалось обновить обложку профиля");
    }
  },

  /**
   * 📄 Обновить расширенную информацию (BIO).
   *
   * bioData (обычный объект):
   *  - bioText?: string
   *  - liveIn?: string
   *  - relationship?: string
   *  - workplace?: string
   *  - education?: string
   *  - phone?: string
   *  - hometown?: string
   *
   * @param {string} userId
   * @param {Object} bioData
   */
  saveBio: async (userId, bioData) => {
    if (!userId) return;

    set({ loading: true, error: null });

    try {
      const updatedBio = await updateUserBio(userId, bioData);

      set((state) => ({
        profile: state.profile
          ? {
              ...state.profile,
              bio: updatedBio,
            }
          : state.profile,
        loading: false,
      }));

      toast.success("Информация профиля обновлена");
    } catch (error) {
      console.error("🔴 Ошибка при обновлении BIO (saveBio):", error);
      set({ error, loading: false });
      toast.error("Не удалось обновить информацию профиля");
    }
  },

  /**
   * 🧹 Очистить состояние профиля.
   * Можно вызывать при уходе со страницы профиля.
   */
  clearProfile: () =>
    set({
      profile: null,
      isOwner: false,
      error: null,
      loading: false,
    }),
}));

export default useProfileStore;
