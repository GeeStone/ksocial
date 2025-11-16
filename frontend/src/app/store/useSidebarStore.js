// === src/app/store/sidebarStore.js ===
"use client";

import { create } from "zustand";

/**
 * Глобальный стор для управления левым сайдбаром.
 * Сейчас он хранит только флаг открытия/закрытия,
 * но при желании сюда можно добавить "активный пункт меню" и т.п.
 */
const useSidebarStore = create((set) => ({
  // открыт ли сайдбар на мобильных
  isSidebarOpen: false,

  // переключение состояния сайдбара
  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
}));

export default useSidebarStore;
