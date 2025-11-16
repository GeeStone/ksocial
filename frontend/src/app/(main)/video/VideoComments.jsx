"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Простое форматирование даты
const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(+d) ? String(value) : d.toLocaleString();
};

/**
 * Список комментариев под видео.
 *
 * comments: массив вида
 *  { _id, text, createdAt, user: { username, profilePicture } }
 */
const VideoComments = ({ comments }) => {
  return (
    <>
      {comments?.map((comment) => {
        const name = comment?.user?.username || "Пользователь";
        const initials =
          name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "U";

        return (
          <div key={comment?._id} className="flex items-start space-x-2 mb-4">
            {/* Аватар автора комментария */}
            <Avatar className="h-8 w-8">
              {comment?.user?.profilePicture ? (
                <AvatarImage src={comment.user.profilePicture} alt={name} />
              ) : (
                <AvatarFallback className="dark:bg-gray-400">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Тело комментария */}
            <div className="flex-1">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-sm">{comment?.text}</p>
              </div>

              {/* Кнопки Like / Reply + дата */}
              <div className="flex items-center mt-1 text-xs text-gray-400 space-x-2">
                <Button variant="ghost" size="sm">
                  Лайк
                </Button>
                <Button variant="ghost" size="sm">
                  Ответить
                </Button>
                <span>{formatDate(comment?.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default VideoComments;
