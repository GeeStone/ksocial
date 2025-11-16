"use client";

/**
 * Одна карточка истории в ленте сторис.
 *
 * Режимы:
 *  - isAddStory = true  — карточка "Добавить историю" для текущего пользователя
 *  - isAddStory = false — обычная история другого пользователя
 *
 * Работа с бэком:
 *  - handleCreateStory(formData) из usePostStore
 *    formData:
 *      media: File (image / video)
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { usePostStore } from "../../store/usePostStore";
import userStore from "../../store/useUserStore";
import ShowStoryPreview from "./ShowStoryPreview";

const StoryCard = ({ isAddStory, story }) => {
  const { user } = userStore();
  const { handleCreateStory } = usePostStore();

  const [filePreview, setFilePreview] = useState(null); // blob-url или url истории
  const [selectedFile, setSelectedFile] = useState(null); // File при создании
  const [fileType, setFileType] = useState(""); // "image" | "video"
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isNewStory, setIsNewStory] = useState(false);

  const fileInputRef = useRef(null);

  // Инициалы: для "добавить историю" берём текущего user, иначе автора story
  const userPlaceholder =
    ((isAddStory ? user?.username : story?.user?.username) || "")
      .split(" ")
      .map((name) => name[0])
      .join("") || "U";

  /**
   * Выбор файла для новой истории
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // чтобы можно было выбрать тот же файл повторно
    if (!file) return;

    const type = file.type.startsWith("video") ? "video" : "image";
    const url = URL.createObjectURL(file);

    setSelectedFile(file);
    setFileType(type);
    setFilePreview(url);
    setIsNewStory(true);
    setShowPreview(true);
  };

  /**
   * Полный сброс состояния модалки/сторис
   */
  const resetStoryState = () => {
    if (
      filePreview &&
      typeof filePreview === "string" &&
      filePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(filePreview);
    }
    setShowPreview(false);
    setSelectedFile(null);
    setFilePreview(null);
    setFileType("");
    setIsNewStory(false);
    setLoading(false);
  };

  /**
   * Отправка истории на бэкенд (создание новой истории)
   */
  const handleCreateStoryPost = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      if (selectedFile) formData.append("media", selectedFile); // имя поля должно совпадать с бэком
      await handleCreateStory(formData);
      resetStoryState();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleClosePreview = () => resetStoryState();

  /**
   * Клик по уже существующей истории — открываем предпросмотр
   */
  const handleStoryClick = () => {
    if (!story || !story.mediaUrl) return;
    setFilePreview(story.mediaUrl);
    setFileType(story.mediaType === "video" ? "video" : "image");
    setIsNewStory(false);
    setShowPreview(true);
  };

  return (
    <>
      <Card
        className="
          relative overflow-hidden group cursor-pointer rounded-xl
          w-32 h-48
          xs:w-36 xs:h-52
          sm:w-40 sm:h-60
          md:w-44 md:h-64
          lg:w-44 lg:h-64
          flex-shrink-0
          bg-white dark:bg-[rgb(28,28,30)]
          border border-gray-200 dark:border-gray-700
        "
        onClick={isAddStory ? undefined : handleStoryClick}
      >
        <CardContent className="p-0 h-full">
          {/* Карточка "Добавить историю" для текущего пользователя */}
          {isAddStory ? (
            <div className="w-full h-full flex flex-col">
              <div className="h-3/4 w-full relative border-b border-gray-200 dark:border-gray-700">
                <Avatar className="w-full h-full rounded-none">
                  {user?.profilePicture ? (
                    <AvatarImage
                      src={user.profilePicture}
                      alt={user?.username || "Вы"}
                      className="object-cover"
                    />
                  ) : (
                    <p className="w-full h-full grid place-items-center text-3xl sm:text-4xl text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-800">
                      {userPlaceholder}
                    </p>
                  )}
                </Avatar>
              </div>

              <div className="h-1/4 w-full bg-gray-50 dark:bg-[rgb(24,24,26)] flex flex-col items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="
                    p-0 h-8 w-8 rounded-full
                    bg-gray-900 text-white hover:bg-gray-800
                    dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200
                    border border-gray-900/10 dark:border-gray-100/10
                  "
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  aria-label="Добавить историю"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <p className="text-[11px] sm:text-xs font-semibold mt-1 text-gray-800 dark:text-gray-100">
                  Создать историю
                </p>
              </div>

              {/* скрытый input с выбором файла */}
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            // Обычная сторис (другого пользователя)
            <>
              {story?.mediaType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={story?.mediaUrl}
                  alt={story?.user?.username || "История"}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <video
                  src={story?.mediaUrl}
                  className="w-full h-full object-cover"
                  controls={false}
                  muted
                  playsInline
                />
              )}

              {/* Аватар автора истории в левом верхнем углу */}
              <div className="absolute top-2 left-2 rounded-full ring-2 ring-gray-100 dark:ring-gray-700">
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                  {story?.user?.profilePicture ? (
                    <AvatarImage
                      src={story.user.profilePicture}
                      alt={story?.user?.username || "Автор"}
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
                      {userPlaceholder}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              {/* Имя автора внизу */}
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-[11px] sm:text-xs font-semibold truncate drop-shadow">
                  {story?.user?.username}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Модалка предпросмотра / публикации истории */}
      {showPreview && (
        <ShowStoryPreview
          file={filePreview}
          fileType={fileType}
          onClose={handleClosePreview}
          onPost={handleCreateStoryPost}
          isNewStory={isNewStory}
          username={isNewStory ? user?.username : story?.user?.username}
          avatar={
            isNewStory ? user?.profilePicture : story?.user?.profilePicture
          }
          isLoading={loading}
        />
      )}
    </>
  );
};

export default StoryCard;
