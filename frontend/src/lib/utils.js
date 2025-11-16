/**
 * 🎛 Общие вспомогательные функции:
 * - cn: объединение className с учётом tailwind-merge
 * - formatDateFromNow / formateDate: "5 минут назад" (на русском)
 * - formatDateInDDMMYYY: форматирование даты в формате ДД.ММ.ГГГГ (ru-RU)
 */

import { clsx } from "clsx";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

/**
 * Утилита для удобного объединения className.
 * Работает как clsx, но учитывает конфликтующие tailwind-классы.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Форматирование даты в виде "5 минут назад", "2 часа назад" и т.п.
 * На основе date-fns с русской локалью.
 *
 * @param {string|Date} date – дата (ISO-строка или объект Date)
 */
export const formatDateFromNow = (date) => {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: ru });
};

/**
 * ⚠️ Историческое имя функции (с опечаткой), чтобы не ломать существующие импорты.
 * Оставляем как алиас к formatDateFromNow.
 */
export const formateDate = formatDateFromNow;

/**
 * Форматирует дату в формате ДД.ММ.ГГГГ (например, 25.12.2024)
 * Используется ru-RU, чтобы интерфейс был полностью русским.
 *
 * @param {string|Date} date
 */
export const formatDateInDDMMYYY = (date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ru-RU"); // ДД.ММ.ГГГГ
};
