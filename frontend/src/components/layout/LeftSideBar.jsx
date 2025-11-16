"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Home,
  LogOut,
  MessageCircle,
  User,
  Users,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useSidebarStore from "../../app/store/useSidebarStore";
import useUserStore from "../../app/store/useUserStore";

const LeftSideBar = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();
  const router = useRouter();
  const { user } = useUserStore();

  const handleNavigation = (path) => {
    router.push(path);

    // На мобиле — закрываем меню после перехода
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const userPlaceholder =
    user?.username
      ?.split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("") || "U";

  const navItems = [
    { icon: Home, label: "Лента", path: "/" },
    { icon: Users, label: "Друзья", path: "/friends" },
    { icon: Video, label: "Видео", path: "/video" },
    { icon: User, label: "Профиль", path: "/profile" },
    { icon: MessageCircle, label: "Сообщения", path: "/messages" },
    { icon: Bell, label: "Уведомления", path: "/notifications" },
  ];

  return (
    <aside
      aria-label="Навигация по kSocial"
      className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)]
        w-64
        border-r border-border/40 
        bg-white dark:bg-[rgb(36,37,38)]
        transition-transform duration-200
        z-40 md:z-20

        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      <div className="flex h-full flex-col justify-between overflow-y-auto px-3 py-4">
        {/* ===== Верх: профиль + меню ===== */}
        <nav className="space-y-3">
          {/* Профиль наверху */}
          <div
            className="flex items-center gap-3 mb-1 cursor-pointer 
                       rounded-lg px-2 py-2 hover:bg-accent/80
                       hover:text-accent-foreground transition-colors"
            onClick={() => handleNavigation("/profile")}
          >
            <Avatar className="h-10 w-10 flex-shrink-0">
              {user?.profilePicture ? (
                <AvatarImage src={user.profilePicture} alt={user?.username} />
              ) : (
                <AvatarFallback>{userPlaceholder}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[15px] leading-tight text-gray-900 dark:text-white truncate">
                {user?.username || "Пользователь"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                Просмотреть профиль
              </span>
            </div>
          </div>

          {/* Пункты навигации */}
          <div className="space-y-1">
            {navItems.map(({ icon: Icon, label, path }) => (
              <Button
                key={label}
                variant="ghost"
                className="
                  w-full justify-start rounded-lg font-normal text-sm
                  text-gray-800 dark:text-gray-200
                  hover:bg-accent/80 hover:text-accent-foreground
                  transition-colors px-2
                "
                onClick={() => handleNavigation(path)}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* ===== Низ: повтор профиля + выход ===== */}
        <div className="pt-4 border-t border-border/40 mt-2">
          <div className="flex items-center gap-3 mb-3 px-2">
            <Avatar className="h-9 w-9 flex-shrink-0">
              {user?.profilePicture ? (
                <AvatarImage src={user.profilePicture} alt={user?.username} />
              ) : (
                <AvatarFallback>{userPlaceholder}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-gray-900 dark:text-white truncate">
                {user?.username || "Пользователь"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                Аккаунт kSocial
              </span>
            </div>
          </div>

          <button
            type="button"
            className="
              w-full flex items-center justify-start
              rounded-lg px-2 py-1.5 text-sm font-medium
              text-red-500 hover:text-red-600 hover:bg-red-500/10
              transition-colors
            "
            onClick={() => handleNavigation("/logout")}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </button>

          <p className="mt-3 px-2 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
            Конфиденциальность · Условия · Реклама
            <br />
            <span className="opacity-80">kSocial © 2025</span>
          </p>
        </div>
      </div>
    </aside>
  );
};

export default LeftSideBar;
