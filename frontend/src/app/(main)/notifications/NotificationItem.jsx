"use client";

/**
 * Одна карточка уведомления
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  ChevronRight,
  Dot,
  Heart,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const getIconByType = (type) => {
  switch (type) {
    case "like":
      return Heart;
    case "comment":
      return MessageCircle;
    case "follow":
      return UserPlus;
    default:
      return Bell;
  }
};

const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(+d)) return String(value);
  return d.toLocaleString();
};

const NotificationItem = ({ notification, onMarkRead }) => {
  const router = useRouter();

  const { _id, type, text, isRead, createdAt, fromUser, link, postId } =
    notification || {};

  const Icon = getIconByType(type);
  const username = fromUser?.username || "Пользователь";

  const initials = useMemo(
    () =>
      username
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("") || "U",
    [username]
  );

  const handleClick = () => {
    if (link) {
      router.push(link);
    } else if (postId) {
      router.push(`/post/${postId}`);
    } else if (fromUser?._id) {
      router.push(`/profile/${fromUser._id}`);
    }
    onMarkRead?.(_id);
  };

  const mainText =
    text ||
    (type === "like"
      ? `${username} лайкнул(а) ваш пост`
      : type === "comment"
      ? `${username} оставил(а) комментарий к вашему посту`
      : type === "follow"
      ? `${username} подписался(ась) на вас`
      : `Новое уведомление от ${username}`);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left flex items-start gap-3 px-3 py-3 sm:px-4 sm:py-3.5 rounded-lg border transition-colors ${
        isRead
          ? "bg-background border-border/60 hover:bg-muted/70"
          : "bg-muted border-border/80 hover:bg-muted/90"
      }`}
    >
      <div className="mt-[2px]">
        <div className="relative">
          <Icon
            className={`h-5 w-5 ${
              isRead ? "text-muted-foreground" : "text-foreground"
            }`}
          />
          {!isRead && (
            <Dot className="absolute -top-1 -right-2 h-4 w-4 text-blue-500" />
          )}
        </div>
      </div>

      <div className="flex-1 flex items-start gap-3 min-w-0">
        <Avatar className="h-9 w-9 flex-shrink-0">
          {fromUser?.profilePicture ? (
            <AvatarImage src={fromUser.profilePicture} alt={username} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="min-w-0">
          <p className="text-sm text-foreground leading-snug">{mainText}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(createdAt)}
          </p>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 hidden sm:block" />
    </button>
  );
};

export default NotificationItem;
