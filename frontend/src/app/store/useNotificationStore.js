import { socket } from "@/service/socketClient"; // правильный импорт socket
import { create } from "zustand";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,

  // Инициализация слушателя событий через WebSocket
  initSocketListener: () => {
    if (socket._hasNotificationListener) return;
    socket._hasNotificationListener = true;

    // Слушаем события с нового поста
    socket.on("notification:new", (notification) => {
      set((state) => {
        const exists = state.notifications.some(
          (n) => n._id === notification._id
        );
        const notifications = exists
          ? state.notifications
          : [notification, ...state.notifications];

        const unreadCount = notifications.filter((n) => !n.isRead).length;
        return { notifications, unreadCount };
      });
    });
  },

  fetchNotifications: async () => {
    try {
      set({ loading: true, error: null });
      const data = await apiGetNotifications();
      const notifications = Array.isArray(data)
        ? data
        : data?.notifications || [];
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      set({ notifications, unreadCount, loading: false });

      // Сразу подписываемся на WebSocket уведомления
      get().initSocketListener();
    } catch (e) {
      console.error("Ошибка загрузки уведомлений:", e);
      set({ error: "Не удалось загрузить уведомления", loading: false });
    }
  },

  markAllAsRead: async () => {
    try {
      await apiMarkAllRead();
    } catch (e) {
      console.error("Ошибка при markAllRead:", e);
    }
    const current = get().notifications;
    const updated = current.map((n) => ({ ...n, isRead: true }));
    set({ notifications: updated, unreadCount: 0 });
  },

  markAsRead: async (id) => {
    if (!id) return;
    const current = get().notifications;
    const updated = current.map((n) =>
      n._id === id ? { ...n, isRead: true } : n
    );
    const unreadCount = updated.filter((n) => !n.isRead).length;
    set({ notifications: updated, unreadCount });

    try {
      await apiMarkNotificationRead(id);
    } catch (e) {
      console.error("Ошибка при markNotificationRead:", e);
    }
  },
}));

export default useNotificationStore;
