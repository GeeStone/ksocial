import useNotificationStore from "@/app/store/useNotificationStore";
import {
  Bell,
  MessageCircle,
  Repeat2,
  ThumbsUp,
  UserPlus2,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const typeIconMap = {
  like: ThumbsUp,
  comment: MessageCircle,
  follow: UserPlus2,
  friend_request: UserPlus2,
  repost: Repeat2,
  story: Bell,
  system: Bell,
};

const NotificationsList = () => {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
    markAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(); // Загружаем уведомления при монтировании компонента
  }, [fetchNotifications]);

  const renderMessage = (n) => {
    const actorName = n.actor?.username || "Пользователь";

    switch (n.type) {
      case "like":
        return `${actorName} понравилась ваша запись`;
      case "comment":
        return `${actorName} прокомментировал(а) вашу запись`;
      case "follow":
      case "friend_request":
        return `${actorName} хочет добавить вас в друзья`;
      case "repost":
        return `${actorName} поделился(лась) вашей записью`;
      case "story":
        return `${actorName} добавил(а) новую сторис`;
      default:
        return n.message || "Новое уведомление";
    }
  };

  const getHref = (n) => {
    if (n.entityType === "post" && n.entityId) {
      return `/posts/${n.entityId}`;
    }
    if (n.entityType === "user" && n.entityId) {
      return `/profile/${n.entityId}`;
    }
    return "#";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Уведомления</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Непрочитанных: {unreadCount}
            </p>
          )}
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs sm:text-sm text-blue-500 hover:text-blue-600"
          >
            Отметить всё как прочитанное
          </button>
        )}
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Загружаем уведомления…</p>
      )}

      {error && <p className="text-sm text-red-500">{String(error)}</p>}

      {!loading && notifications.length === 0 && (
        <p className="text-sm text-muted-foreground">Уведомлений пока нет.</p>
      )}

      <div className="space-y-2">
        {notifications.map((n) => {
          const Icon = typeIconMap[n.type] || Bell;
          const createdAt = n.createdAt
            ? new Date(n.createdAt).toLocaleString()
            : "";

          return (
            <div
              key={n._id}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2 sm:px-4 sm:py-3 cursor-pointer
                ${
                  n.isRead
                    ? "bg-background/60"
                    : "bg-blue-50/70 dark:bg-blue-950/40 border-blue-300/70 dark:border-blue-700/60"
                }`}
              onClick={() => !n.isRead && markAsRead(n._id)}
            >
              <div className="mt-0.5">
                <Icon className="h-5 w-5 text-blue-500" />
              </div>

              <div className="flex-1 min-w-0">
                <Link href={getHref(n)} className="block hover:underline">
                  <p className="text-sm sm:text-[15px] leading-snug">
                    {renderMessage(n)}
                  </p>
                </Link>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {createdAt}
                </p>
              </div>

              {!n.isRead && (
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsList;
