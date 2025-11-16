"use client";

/**
 * Карточка одного поста в ленте.
 */

import { usePostStore } from "@/app/store/usePostStore";
import useUserStore from "@/app/store/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLink,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share2,
  ThumbsUp,
  Trash2,
  Twitter,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import PostComments from "./PostComments";

/** Склонения для чисел: 1 лайк / 2 лайка / 5 лайков */
const plural = (n, one, few, many) => {
  const v = Math.abs(n) % 100;
  const v1 = v % 10;
  if (v > 10 && v < 20) return many;
  if (v1 > 1 && v1 < 5) return few;
  if (v1 === 1) return one;
  return many;
};

const PostCard = ({ post, isLiked, onShare, onComment, onLike }) => {
  const {
    handleDeleteCommentPost,
    handleDeletePost,
    handleLikeCommentPost,
    handleSharePost,
  } = usePostStore();

  const { user: currentUser } = useUserStore();

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const userName = post?.user?.username || "Неизвестный пользователь";

  // Автор поста = текущий пользователь?
  const isOwner =
    currentUser?._id &&
    post?.user?._id &&
    String(currentUser._id) === String(post.user._id);

  // Инициалы автора поста
  const userPlaceholder = useMemo(
    () =>
      userName
        ? userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "U",
    [userName]
  );

  // Нормальное отображение даты
  const createdAt = useMemo(() => {
    if (!post?.createdAt) return "";
    const d = new Date(post.createdAt);
    return isNaN(+d) ? String(post.createdAt) : d.toLocaleString();
  }, [post?.createdAt]);

  const likeCount =
    typeof post?.likeCount === "number"
      ? post.likeCount
      : Array.isArray(post?.likes)
      ? post.likes.length
      : 0;

  const commentsCount = Array.isArray(post?.comments)
    ? post.comments.length
    : post?.commentCount || 0;

  const shareCount = typeof post?.shareCount === "number" ? post.shareCount : 0;

  /** 🔗 Генерация ссылки на страницу поста: /posts/[id] */
  const generateSharedLink = () => {
    const origin =
      (typeof window !== "undefined" && window.location.origin) ||
      process.env.NEXT_PUBLIC_FRONTEND_ORIGIN ||
      "http://localhost:3000";

    const id = post?._id ?? post?.id ?? "";
    return `${origin}/posts/${id}`;
  };

  const webShare = async (url) => {
    try {
      if (navigator.share) {
        await navigator.share({ url });
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  };

  const likeText = `${likeCount} ${plural(
    likeCount,
    "лайк",
    "лайка",
    "лайков"
  )}`;
  const commentsText = `${commentsCount} ${plural(
    commentsCount,
    "комментарий",
    "комментария",
    "комментариев"
  )}`;
  const shareText = `${shareCount} ${plural(
    shareCount,
    "репост",
    "репоста",
    "репостов"
  )}`;

  /** 🗑 Удаление своего поста */
  const handleDeletePostClick = async () => {
    if (!post?._id) return;
    const ok = window.confirm("Удалить этот пост?");
    if (!ok) return;

    try {
      await handleDeletePost(post._id);
      toast.success("Пост удалён");
    } catch (e) {
      console.error("Ошибка при удалении поста:", e);
      toast.error("Не удалось удалить пост");
    }
  };

  /** 🔁 «Добавить пост себе» (репост внутри kSocial) */
  const handleRepostToMyFeed = async () => {
    if (!post?._id) return;
    try {
      await handleSharePost(post._id);
      setIsShareDialogOpen(false);
      toast.success("Пост добавлен к вам в ленту");
    } catch (e) {
      console.error("Ошибка при репосте:", e);
      toast.error("Не удалось поделиться постом");
    }
  };

  /** Открыть пост в новой вкладке */
  const handleOpenPostInNewTab = () => {
    const url = generateSharedLink();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /** Скопировать ссылку на пост */
  const handleCopyPostLink = async () => {
    const url = generateSharedLink();
    try {
      await navigator.clipboard?.writeText(url);
      toast.success("Ссылка на пост скопирована");
    } catch {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  /**
   * Обработка вариантов внешнего шаринга
   * platform: "native" | "facebook" | "twitter" | "linkedin" | "copy"
   */
  const handleExternalShare = async (platform) => {
    const url = generateSharedLink();
    const u = encodeURIComponent(url);

    if (platform === "native" && (await webShare(url))) {
      onShare?.(post?._id, "native");
      setIsShareDialogOpen(false);
      return;
    }

    let shareUrl = null;
    if (platform === "facebook")
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    if (platform === "twitter")
      shareUrl = `https://twitter.com/intent/tweet?url=${u}`;
    if (platform === "linkedin")
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;

    if (platform === "copy") {
      await handleCopyPostLink();
      setIsShareDialogOpen(false);
      onShare?.(post?._id, "copy");
      return;
    }

    if (shareUrl) window.open(shareUrl, "_blank", "noopener,noreferrer");
    onShare?.(post?._id, platform);
  };

  return (
    <motion.div
      key={post?._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="dark:bg-[rgb(36,37,38)] bg-white border border-gray-200 dark:border-gray-700">
        <CardContent className="p-3 sm:p-4 md:p-6">
          {/* Шапка поста: автор + дата + действия */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                {post?.user?.profilePicture ? (
                  <AvatarImage src={post.user.profilePicture} alt={userName} />
                ) : (
                  <AvatarFallback>{userPlaceholder}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  {userName}
                </p>
                {!!createdAt && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {createdAt}
                  </p>
                )}
              </div>
            </div>

            {/* Кнопки действий в шапке поста */}
            <div className="flex items-center gap-1">
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="dark:hover:bg-gray-600 text-red-500 hover:text-red-600"
                  onClick={handleDeletePostClick}
                  aria-label="Удалить пост"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              {/* Меню дополнительных действий (три точки) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="dark:hover:bg-gray-600"
                    aria-label="Дополнительные действия"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 dark:bg-[rgb(36,37,38)]"
                >
                  <DropdownMenuItem onClick={handleOpenPostInNewTab}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span>Открыть пост в новой вкладке</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyPostLink}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    <span>Скопировать ссылку на пост</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {isOwner && (
                    <DropdownMenuItem
                      onClick={handleDeletePostClick}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Удалить пост</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Текст поста */}
          {post?.content && (
            <p className="mb-3 sm:mb-4 text-gray-900 dark:text-gray-200 text-sm sm:text-base">
              {post.content}
            </p>
          )}

          {/* Медиа: изображение */}
          {post?.mediaUrl && post.mediaType === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.mediaUrl}
              alt="Изображение поста"
              className="w-full h-auto rounded-lg mb-3 sm:mb-4 max-h-[70vh] object-contain"
            />
          )}

          {/* Медиа: видео */}
          {post?.mediaUrl && post.mediaType === "video" && (
            <video
              controls
              className="w-full rounded-lg mb-3 sm:mb-4 h-[56vw] sm:h-[360px] md:h-[420px] lg:h-[500px]"
            >
              <source src={post.mediaUrl} type="video/mp4" />
              Ваш браузер не поддерживает видео-тег
            </video>
          )}

          {/* Статистика */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-400">
              {likeText}
            </span>
            <div className="flex gap-2 text-[11px] sm:text-sm">
              <span
                className="text-gray-600 dark:text-gray-400 cursor-pointer"
                onClick={() => setShowComments((v) => !v)}
              >
                {commentsText}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {shareText}
              </span>
            </div>
          </div>

          <Separator className="mb-2 dark:bg-gray-500" />

          {/* Кнопки действий под постом */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2">
            <Button
              variant="ghost"
              className="w-full dark:hover:bg-gray-700 py-2 sm:py-2.5 text-[11px] sm:text-sm"
              onClick={() => onLike?.(post?._id)}
            >
              <ThumbsUp className="mr-1.5 sm:mr-2 h-4 w-4 text-gray-700 dark:text-gray-200" />
              Нравится
            </Button>

            <Button
              variant="ghost"
              className="w-full dark:hover:bg-gray-700 py-2 sm:py-2.5 text-[11px] sm:text-sm"
              onClick={() => setShowComments((v) => !v)}
            >
              <MessageCircle className="mr-1.5 sm:mr-2 h-4 w-4 text-gray-700 dark:text-gray-200" />
              Комментировать
            </Button>

            {/* Диалог "Поделиться" */}
            <Dialog
              open={isShareDialogOpen}
              onOpenChange={setIsShareDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full dark:hover:bg-gray-700 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                >
                  <Share2 className="mr-1.5 sm:mr-2 h-4 w-4 text-gray-700 dark:text-gray-200" />
                  Поделиться
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[400px] w-[92vw] sm:w-auto p-4 sm:p-6 rounded-xl dark:bg-[rgb(36,37,38)] bg-white border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold mb-1">
                    Поделиться публикацией
                  </DialogTitle>
                  <DialogDescription className="text-sm mb-4 text-gray-500 dark:text-gray-400">
                    Выберите, как хотите поделиться этим постом
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col space-y-3">
                  {/* Репост внутрь kSocial */}
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleRepostToMyFeed}
                  >
                    <Repeat2 className="h-4 w-4" />
                    Добавить пост себе
                  </Button>

                  {/* Шаринг через устройство / соцсети */}
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleExternalShare("native")}
                  >
                    <Share2 className="h-4 w-4" />
                    Поделиться через устройство
                  </Button>
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleExternalShare("facebook")}
                  >
                    <Facebook className="h-4 w-4" /> Facebook
                  </Button>
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleExternalShare("twitter")}
                  >
                    <Twitter className="h-4 w-4" /> Twitter
                  </Button>
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleExternalShare("linkedin")}
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </Button>
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleExternalShare("copy")}
                  >
                    <LinkIcon className="h-4 w-4" /> Скопировать ссылку
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Separator className="mb-2 dark:bg-gray-500" />

          {/* Комментарии */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PostComments
                  post={post}
                  onAddComment={onComment}
                  onDeleteComment={(commentId) =>
                    handleDeleteCommentPost(post._id, commentId)
                  }
                  onLikeComment={(commentId) =>
                    handleLikeCommentPost(post._id, commentId)
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PostCard;
