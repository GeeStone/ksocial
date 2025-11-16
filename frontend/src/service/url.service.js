// === src/service/url.service.js ===
// Общий axios-инстанс для работы с бэкендом
import axios from "axios";

/**
 * Базовый URL бэкенда берём из переменной окружения фронта.
 *
 * В .env (фронт):
 * NEXT_PUBLIC_BACKEND_URL = http://localhost:8080
 * или, например,
 * NEXT_PUBLIC_BACKEND_URL = https://api.mysocial.ru
 */

const ApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

// *** ВРЕМЕННО: лог в браузер, чтобы убедиться ***
if (typeof window !== "undefined") {
  console.log("[axios] baseURL =", ApiUrl);
}

const axiosInstance = axios.create({
  baseURL: ApiUrl,
  withCredentials: true, // auth_token из куки будет отправляться
});

export default axiosInstance;
