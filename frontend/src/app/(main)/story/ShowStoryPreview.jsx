"use client";

/**
 * Модалка предпросмотра сторис.
 *
 * Используется и для:
 *  - просмотра уже существующей истории
 *  - подтверждения перед публикацией новой (isNewStory === true)
 *
 * Важно:
 *  - блокируем прокрутку body пока модалка открыта
 *  - закрываем по клику на фон и по Esc
 *  - рендерим через createPortal прямо в document.body,
 *    чтобы не зависеть от transform у родителей
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

const ShowStoryPreview = ({
  file, // ссылка на файл (blob:... или url из бэка)
  fileType, // "image" | "video"
  onClose, // колбэк закрытия модалки
  onPost, // колбэк публикации новой истории
  isNewStory, // true — новая сторис, false — просмотр существующей
  username,
  avatar,
  isLoading,
}) => {
  const userPlaceholder =
    username
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "U";

  // 🔒 Блокируем скролл body и возвращаем как было при размонтировании
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ⎋ Закрытие по клавише Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Закрытие по клику на подложку (но не по самому контенту)
  const handleBackdrop = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose?.();
    },
    [onClose]
  );

  const modal = (
    <div
      className="
        fixed inset-0 z-[100000] isolate grid place-items-center
        bg-black/70 p-0 sm:p-4
        [padding-inline:env(safe-area-inset-left)_env(safe-area-inset-right)]
        [padding-bottom:env(safe-area-inset-bottom)]
      "
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр истории"
      onClick={handleBackdrop}
    >
      <div
        className="
          relative w-screen h-screen sm:w-full sm:max-w-md sm:h-[78vh]
          min-h-0 flex flex-col rounded-none sm:rounded-xl overflow-hidden
          bg-white dark:bg-[rgb(18,18,20)]
          border border-gray-200 dark:border-gray-700
          shadow-2xl
        "
      >
        {/* Кнопка закрытия */}
        <Button
          className="
            absolute top-4 right-4 z-10
            text-gray-700 dark:text-gray-200
            hover:bg-gray-100/80 dark:hover:bg-gray-700/70
            rounded-full
          "
          variant="ghost"
          onClick={onClose}
          aria-label="Закрыть предпросмотр"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Информация о пользователе сверху слева */}
        <div className="absolute top-4 left-4 z-10 flex items-center max-w-[80%]">
          <Avatar className="w-9 h-9 mr-2 border border-gray-200 dark:border-gray-700">
            {avatar ? (
              <AvatarImage src={avatar} alt={username || "Пользователь"} />
            ) : (
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                {userPlaceholder}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="text-gray-900 dark:text-gray-100 font-semibold truncate">
            {username}
          </span>
        </div>

        {/* Основной контент: картинка или видео */}
        <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-100 dark:bg-[rgb(10,10,12)]">
          {fileType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file || ""}
              alt="Предпросмотр истории"
              className="w-full h-full object-contain"
              draggable={false}
            />
          ) : (
            <video
              src={file || ""}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Кнопка публикации показывается только для новой истории */}
        {isNewStory && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Button
              onClick={onPost}
              disabled={!!isLoading}
              className="
                px-6
                bg-gray-900 text-white hover:bg-gray-800
                dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200
                font-semibold
              "
            >
              {isLoading ? "Сохраняем…" : "Поделиться историей"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Портал в body, чтобы не ломался z-index и трансформации
  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
};

export default ShowStoryPreview;
