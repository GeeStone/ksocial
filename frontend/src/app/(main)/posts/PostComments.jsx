"use client";

/**
 * Блок комментариев под постом.
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import useUserStore from "../../store/useUserStore";

/** Инициалы по имени */
const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "U";

/** Форматирование даты комментария */
const fmtDate = (v) => {
  const d = new Date(v);
  return isNaN(+d) ? String(v ?? "") : d.toLocaleString();
};

const PostComments = ({
  post,
  onAddComment,
  onDeleteComment,
  onLikeComment,
}) => {
  const [showAllComments, setShowAllComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { user } = useUserStore();

  const comments = useMemo(() => post?.comments || [], [post?.comments]);
  const visible = showAllComments ? comments : comments.slice(0, 3);

  const currentName = user?.username || "Пользователь";
  const currentAvatar = user?.profilePicture || null;
  const currentUserId = user?._id;

  /**
   * Отправка нового комментария
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text || !post?._id || !onAddComment) return;

    try {
      setSubmitting(true);
      await onAddComment(post._id, text);
      setNewComment("");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Удаление комментария (только для автора)
   */
  const handleDelete = async (commentId) => {
    if (!onDeleteComment || !commentId) return;
    try {
      setDeletingId(commentId);
      await onDeleteComment(commentId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100 text-sm sm:text-base">
        Комментарии
      </h3>

      {/* Список комментариев */}
      <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
        {visible.map((c, i) => {
          const name = c?.user?.username || "Пользователь";
          const isOwner =
            currentUserId && c?.user?._id
              ? String(currentUserId) === String(c.user._id)
              : false;

          const likeCount =
            typeof c?.likeCount === "number"
              ? c.likeCount
              : Array.isArray(c?.likes)
              ? c.likes.length
              : 0;

          const isLiked =
            typeof c?.isLiked === "boolean"
              ? c.isLiked
              : currentUserId && Array.isArray(c?.likes)
              ? c.likes.some((id) => String(id) === String(currentUserId))
              : false;

          return (
            <div
              key={c?._id || `${i}-${c?.createdAt || ""}`}
              className="flex items-start space-x-3 text-gray-900 dark:text-gray-100"
            >
              {/* Аватар автора комментария */}
              <Avatar className="h-8 w-8 flex-shrink-0 mt-[2px]">
                {c?.user?.profilePicture ? (
                  <AvatarImage src={c.user.profilePicture} alt={name} />
                ) : (
                  <AvatarFallback className="bg-gray-600 text-white text-sm">
                    {initials(name)}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1">
                {/* Пузырь комментария + кнопка удаления для автора */}
                <div className="flex items-start gap-2">
                  <div className="flex-1 bg-[#f0f2f5] dark:bg-[#1a1d29] hover:bg-[#e6e7eb] dark:hover:bg-[#232634] rounded-lg p-2 transition-colors duration-150">
                    <p className="font-semibold text-xs sm:text-sm mb-[2px] leading-tight">
                      {name}
                    </p>
                    <p className="text-xs sm:text-sm leading-snug">
                      {c?.text || ""}
                    </p>
                  </div>

                  {isOwner && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(c._id)}
                      disabled={deletingId === c._id}
                      className="h-7 w-7 flex-shrink-0 text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                      aria-label="Удалить комментарий"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Подпись под комментарием */}
                <div className="flex items-center mt-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`px-1 h-auto text-[11px] sm:text-xs hover:text-blue-600 dark:hover:text-blue-400 ${
                      isLiked
                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                        : ""
                    }`}
                    onClick={() => onLikeComment?.(c._id)}
                  >
                    Нравится
                    {likeCount > 0 && (
                      <span className="ml-1">· {likeCount}</span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-1 h-auto text-[11px] sm:text-xs hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Ответить
                  </Button>
                  <span>{fmtDate(c?.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Кнопка «Показать все / скрыть» */}
        {comments.length > 3 && (
          <button
            onClick={() => setShowAllComments((v) => !v)}
            className="flex items-center text-blue-600 dark:text-blue-400 mt-1 text-sm font-medium hover:underline"
          >
            {showAllComments ? (
              <>
                Скрыть комментарии <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Показать все комментарии{" "}
                <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Поле ввода нового комментария */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-center space-x-2"
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          {currentAvatar ? (
            <AvatarImage src={currentAvatar} alt={currentName} />
          ) : (
            <AvatarFallback className="bg-gray-600 text-white text-sm">
              {initials(currentName)}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 flex items-center bg-[#242526] dark:bg-[#242526] rounded-full px-3 py-1.5">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-100 placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="ml-2 text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostComments;
