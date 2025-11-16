// === src/app/store/uiStore.js ===
"use client";

import { create } from "zustand";

/**
 * Общий UI-стор для различных модалок и глобальных состояний интерфейса.
 * Можно расширять по мере роста KSocial.
 */
const useUIStore = create((set) => ({
  // глобальный индикатор "что-то грузится" (если нужно поверх страниц)
  isGlobalLoading: false,

  // модалка создания поста
  isCreatePostModalOpen: false,

  setGlobalLoading: (value) => set({ isGlobalLoading: !!value }),

  openCreatePostModal: () => set({ isCreatePostModalOpen: true }),
  closeCreatePostModal: () => set({ isCreatePostModalOpen: false }),
}));

export default useUIStore;
