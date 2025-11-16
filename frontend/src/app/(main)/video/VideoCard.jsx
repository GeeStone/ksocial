"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Clock, MessageCircle, Send, Share2, ThumbsUp } from "lucide-react";
import useUserStore from "../../store/useUserStore";
import VideoComments from "./VideoComments";

/**
 * Карточка одного видеопоста.
 *
 * Пропсы:
 *  - post        — объект поста
 *  - isLiked     — лайкнул ли текущий пользователь пост
 *  - onLike      — обработчик лайка
 *  - onComment   — (async) отправка комментария наверх
 *  - onShare     — (async) логика репоста на бэкенд
 */
const VideoCard = ({ post, isLiked, onShare, onComment, onLike }) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const commentInputRef = useRef(null);
  const { user } = useUserStore();

  // Открытие блока комментариев + фокус на поле ввода
  const handleCommentClick = () => {
    setShowComments(true);
    setTimeout(() => {
      commentInputRef?.current?.focus();
    }, 0);
  };

  // Инициалы текущего юзера (который пишет комментарий)
  const currentUserPlaceholder =
    user?.username
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "U";

  // Инициалы автора поста
  const postUserPlaceholder =
    post?.user?.username
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "U";

  // Отправка комментария наверх
  const handleCommentSubmit = async () => {
    const text = commentText.trim();
    if (!text) return;

    await onComment?.({ text });
    setCommentText("");
  };

  // Форматирование даты создания поста
  const createdAt = (() => {
    if (!post?.createdAt) return "";
    const d = new Date(post.createdAt);
    return isNaN(+d) ? String(post.createdAt) : d.toLocaleString();
  })();

  // Генерация ссылки на пост
  const generateSharedLink = () => {
    const origin =
      (typeof window !== "undefined" && window.location.origin) ||
      "http://localhost:3000";
    const id = post?._id || post?.id || "";
    return `${origin}/post/${id}`;
  };

  // Открытие внешних шаринг-ссылок
  const handleShare = (platform) => {
    const url = generateSharedLink();
    const encoded = encodeURIComponent(url);
    let shareUrl = null;

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encoded}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encoded}`;
        break;
      case "copy":
        if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(url);
        }
        setIsShareDialogOpen(false);
        return;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
    setIsShareDialogOpen(false);
  };

  return (
    <motion.div
      key={post?._id}
      initial={{ opacity: 0, y: 20 }} // анимация появления
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-[rgb(36,37,38)] rounded-lg"
    >
      {/* ====== ШАПКА ПОСТА (автор + дата) ====== */}
      <div className="flex items-center justify-between mb-4 px-4 mt-2">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 rounded-full mr-3">
            {post?.user?.profilePicture ? (
              <AvatarImage
                src={post.user.profilePicture}
                alt={post.user.username}
              />
            ) : (
              <AvatarFallback className="dark:bg-gray-400">
                {postUserPlaceholder}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-semibold dark:text-white">
              {post?.user?.username || "Пользователь"}
            </p>
          </div>
        </div>

        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm">{createdAt}</span>
        </div>
      </div>

      {/* ====== ВИДЕО ====== */}
      <div className="relative aspect-video bg-black mb-4">
        {post?.mediaUrl && (
          <video
            controls
            className="w-full h-[500px] rounded-lg mb-4 object-contain"
          >
            <source src={post.mediaUrl} type="video/mp4" />
            Ваш браузер не поддерживает тег video
          </video>
        )}
      </div>

      {/* ====== КНОПКИ ДЕЙСТВИЙ ====== */}
      <div className="md:flex justify-between px-2 mb-2 items-center">
        <div className="flex space-x-4">
          {/* Лайк */}
          <Button
            variant="ghost"
            className={`flex dark:hover:bg-gray-600 ${
              isLiked ? "text-blue-600" : ""
            }`}
            onClick={onLike}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            <span>{isLiked ? "Нравится" : "Лайк"}</span>
          </Button>

          {/* Комментарий */}
          <Button
            variant="ghost"
            className="flex items-center dark:hover:bg-gray-600"
            onClick={handleCommentClick}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>Комментировать</span>
          </Button>

          {/* Шеринг */}
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center dark:hover:bg-gray-500"
                onClick={onShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                <span>Поделиться</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Поделиться постом</DialogTitle>
                <DialogDescription>
                  Выберите, где вы хотите поделиться этим постом
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col space-y-4">
                <Button onClick={() => handleShare("facebook")}>
                  Поделиться в Facebook
                </Button>
                <Button onClick={() => handleShare("twitter")}>
                  Поделиться в X (Twitter)
                </Button>
                <Button onClick={() => handleShare("linkedin")}>
                  Поделиться в LinkedIn
                </Button>
                <Button onClick={() => handleShare("copy")}>
                  Скопировать ссылку
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Мини-статистика по посту */}
        <div className="flex space-x-4 ml-2 text-sm text-gray-500 dark:text-gray-400">
          <Button variant="ghost" size="sm">
            {post?.likeCount || 0} лайков
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments((v) => !v)}
          >
            {post?.commentCount || post?.comments?.length || 0} комментариев
          </Button>

          <Button variant="ghost" size="sm">
            {post?.shareCount || 0} репостов
          </Button>
        </div>
      </div>

      {/* ====== КОММЕНТАРИИ ====== */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Список комментариев */}
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <VideoComments comments={post?.comments || []} />
            </ScrollArea>

            {/* Форма отправки нового комментария */}
            <div className="flex items-center mt-4 p-2">
              <Avatar className="h-10 w-10 rounded mr-3">
                {user?.profilePicture ? (
                  <AvatarImage
                    src={user.profilePicture}
                    alt={user?.username || "User"}
                  />
                ) : (
                  <AvatarFallback className="dark:bg-gray-400">
                    {currentUserPlaceholder}
                  </AvatarFallback>
                )}
              </Avatar>

              <Input
                className="flex-1 mr-2 dark:border-gray-400"
                placeholder="Напишите комментарий..."
                value={commentText}
                ref={commentInputRef}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
              />

              <Button onClick={handleCommentSubmit}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoCard;
