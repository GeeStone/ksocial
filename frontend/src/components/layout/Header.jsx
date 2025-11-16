"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import useSidebarStore from "@/app/store/useSidebarStore"; // 👈 NEW
import useUserStore from "@/app/store/useUserStore";

import { logout } from "@/service/auth.service";
import { motion } from "framer-motion";
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Newspaper,
  Search,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user, clearUser } = useUserStore();
  const { toggleSidebar } = useSidebarStore(); // 👈 NEW
  const router = useRouter();
  const pathname = usePathname();

  const initials =
    user?.username
      ?.split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("") || "U";

  const goTo = (path) => router.push(path);

  const handleLogout = async () => {
    try {
      const res = await logout();
      clearUser();
      router.push("/login");
      toast.success(res?.message || "Вы вышли из аккаунта");
    } catch (error) {
      toast.error("Не удалось выйти из аккаунта");
    }
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const centerNav = [
    {
      key: "feed",
      label: "Новости",
      icon: Newspaper,
      path: "/",
      isActive:
        pathname === "/" ||
        pathname.startsWith("/post") ||
        pathname.startsWith("/profile"),
    },
    {
      key: "notifications",
      label: "Уведомления",
      icon: Bell,
      path: "/notifications",
      isActive: pathname.startsWith("/notifications"),
    },
  ];

  return (
    <header
      className="
        fixed top-0 inset-x-0 z-[60] h-16
        bg-[hsl(var(--background-header))]
        border-b border-border
        backdrop-blur
        supports-[backdrop-filter]:bg-[hsl(var(--background-header))]/95
      "
    >
      <div className="flex items-center justify-between h-full px-3 sm:px-4 md:px-6 gap-4">
        {/* Левая часть — бургер + kSocial (ширину не трогаем) */}
        <div className="flex items-center gap-2">
          {/* Бургер только на мобилках */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={toggleSidebar}
            aria-label="Открыть меню"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div
            onClick={() => goTo("/")}
            className="
              text-lg sm:text-xl font-semibold tracking-wide
              cursor-pointer select-none
              text-[hsl(var(--foreground))]
              dark:text-white
              whitespace-nowrap
            "
          >
            kSocial
          </div>
        </div>

        {/* ЦЕНТР — как у тебя было, не сокращаю */}
        <div className="flex-1 flex justify-center">
          <div className="w-full mx-auto max-w-[100vw] sm:max-w-2xl xl:max-w-3xl flex items-center gap-3">
            {/* Поисковая строка */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск в kSocial…"
                  className="
                    w-full h-10 pl-9 pr-3
                    rounded-full
                    bg-muted
                    border border-border
                    text-sm
                    placeholder:text-muted-foreground
                    focus:outline-none
                    focus:ring-2 focus:ring-[hsl(var(--ring))]
                    focus:border-transparent
                    transition
                  "
                />
              </div>
            </div>

            {/* Меню по центру между логотипом и аватаркой */}
            <div
              className="
                hidden sm:flex items-center gap-1
                rounded-full bg-muted/70 border border-border px-1 py-0.5
              "
            >
              {centerNav.map(({ key, label, icon: Icon, path, isActive }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => goTo(path)}
                  className={`
                    inline-flex items-center gap-1
                    h-8 px-3 rounded-full text-xs sm:text-sm
                    transition-colors
                    ${
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Правая часть — без изменений */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleTheme}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </motion.div>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="
                  rounded-full p-[2px]
                  transition-all duration-200
                  hover:shadow-md
                  border border-border
                "
              >
                <Avatar className="h-9 w-9">
                  {user?.profilePicture ? (
                    <AvatarImage
                      src={user.profilePicture}
                      alt={user.username}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="
                w-64 z-[80]
                bg-background
                text-foreground
                border border-border
                shadow-lg
              "
            >
              <DropdownMenuLabel>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    {user?.profilePicture ? (
                      <AvatarImage
                        src={user.profilePicture}
                        alt={user?.username}
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {user?.username}
                    </p>
                    {user?.email && (
                      <p className="text-xs mt-1 text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => goTo("/profile")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Профиль</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => goTo("/messages")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Newspaper className="w-4 h-4" />
                <span>Сообщения</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => goTo("/notifications")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Уведомления</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Выйти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
