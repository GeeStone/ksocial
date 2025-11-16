// === src/app/store/userStore.js ===
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Стор пользователя.
 *
 * Хранит:
 *  - user: объект текущего пользователя (или null)
 *
 * Использование:
 *  const { user, setUser, clearUser } = useUserStore();
 */
const useUserStore = create(
  persist(
    (set) => ({
      user: null,

      /**
       * Установить данные пользователя (после логина / check-auth).
       * Ожидается объект, который вернул бэкенд.
       */
      setUser: (userData) => set({ user: userData }),

      /**
       * Очистить пользователя (при логауте или ошибке авторизации).
       */
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage", // ключ в localStorage
      storage: createJSONStorage(() => localStorage),
      // при желании можно ограничить набор полей:
      // partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useUserStore;
