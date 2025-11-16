/**
 * Сервис для работы с уведомлениями.
 *
 * Эндпоинты на бэке:
 *  GET    /notifications            — получить список уведомлений
 *  PATCH  /notifications/read-all   — отметить все как прочитанные
 *  PATCH  /notifications/:id/read   — отметить одно уведомление как прочитанное
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const withBase = (path) => {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL не задан в .env");
  }
  return `${BASE_URL}${path}`;
};

// Общая функция запросов
async function request(path, options = {}) {
  const res = await fetch(withBase(path), {
    credentials: "include", // важно: передаём куки с auth_token
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Ошибка запроса ${path}: ${res.status} ${res.statusText} ${text}`
    );
  }

  // если пустой ответ — вернём null
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

/** Получить список уведомлений текущего пользователя */
export async function apiGetNotifications() {
  // GET /notifications
  return request("/notifications", {
    method: "GET",
  });
}

/** Отметить все уведомления как прочитанные */
export async function apiMarkAllRead() {
  // PATCH /notifications/read-all
  return request("/notifications/read-all", {
    method: "PATCH",
  });
}

/** Отметить одно уведомление как прочитанное */
export async function apiMarkNotificationRead(id) {
  if (!id) return null;
  // PATCH /notifications/:id/read
  return request(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}
