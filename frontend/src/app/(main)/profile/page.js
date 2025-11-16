"use client";

/**
 * /profile
 * ========
 * Техническая страница, которая редиректит авторизованного
 * пользователя на его личный профиль /profile/:id
 */

import useUserStore from "@/app/store/useUserStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProfileRootPage = () => {
  const router = useRouter();
  const { user } = useUserStore();

  useEffect(() => {
    if (user?._id) {
      router.replace(`/profile/${user._id}`);
    } else {
      // если по какой-то причине нет пользователя — на главную/логин
      router.replace("/auth");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      Открываем профиль...
    </div>
  );
};

export default ProfileRootPage;
