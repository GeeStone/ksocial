"use client";

/**
 * Карточка поста на странице профиля.
 * Пока использует упрощённые данные (контент, mediaUrl, comments).
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ThumbsUp } from "lucide-react";

const PostsContent = ({ post }) => {
  const author = post.user || {};
  const username = author.username || "Пользователь";

  const initials =
    (username || "U")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <Card className="border border-border bg-white/80 shadow-sm backdrop-blur dark:bg-neutral-900/60 dark:border-neutral-700">
      <CardContent className="p-4 sm:p-5 space-y-3">
        {/* Хедер поста */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={author.profilePicture || undefined}
              alt={username}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {username}
            </span>
            {post.createdAt && (
              <span className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleString("ru-RU", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Текст поста */}
        {post.content && (
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {post.content}
          </p>
        )}

        {/* Медиа, если есть */}
        {post.mediaUrl && post.mediaType === "image" && (
          <div className="overflow-hidden rounded-lg">
            <img
              src={post.mediaUrl}
              alt="Пост"
              className="h-auto w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
            />
          </div>
        )}

        {/* Футер (лайки/комменты — пока декоративно) */}
        <div className="mt-2 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{post.likeCount ?? post.likes?.length ?? 0} лайков</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments?.length ?? 0} комментариев</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostsContent;
