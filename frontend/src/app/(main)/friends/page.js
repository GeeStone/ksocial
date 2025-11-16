"use client";

/**
 * Страница "Друзья":
 *  - входящие заявки
 *  - рекомендации
 *  - мои друзья
 *  - все пользователи (кроме текущего)
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import useFriendsStore from "@/app/store/useFriendsStore";
import FriendRequest from "./FriendRequest";
import FriendsSuggestion from "./FriendsSuggestion";

import LeftSideBar from "@/components/layout/LeftSideBar";

const FriendsPage = () => {
  const {
    incomingRequests,
    suggestions,
    allUsers,
    friends, // ✅ новые друзья
    loading,
    fetchIncomingRequests,
    fetchSuggestions,
    fetchAllUsers,
    fetchFriends, // ✅ новая функция
  } = useFriendsStore();

  useEffect(() => {
    fetchIncomingRequests();
    fetchSuggestions();
    fetchAllUsers();
    fetchFriends(); // отдельно подгружаем список друзей
  }, [fetchIncomingRequests, fetchSuggestions, fetchAllUsers, fetchFriends]);

  const renderEmptyStub = (text) => (
    <div className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
      {text}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Левый сайдбар */}
      <LeftSideBar />

      {/* Основной контент */}
      <main className="flex-1 px-3 sm:px-4 lg:px-6 pt-20 sm:pt-24 pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Друзья
          </h1>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Загружаем список друзей…</span>
            </div>
          )}

          {/* === БЛОК 1. Входящие заявки === */}
          <section className="bg-transparent">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Заявки в друзья
            </h2>

            {incomingRequests && incomingRequests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {incomingRequests.map((friend) => (
                  <FriendRequest key={friend._id} friend={friend} />
                ))}
              </div>
            ) : (
              renderEmptyStub("Сейчас нет входящих заявок.")
            )}
          </section>

          {/* === БЛОК 2. Мои друзья === */}
          <section className="bg-transparent">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Мои друзья
            </h2>

            {friends && friends.length > 0 ? (
              <div className="bg-white dark:bg-[rgb(36,37,38)] rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                {friends.map((user) => {
                  const name = user?.username || user?.email || "Без имени";

                  const initials =
                    name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((s) => s[0])
                      .join("")
                      .toUpperCase() || "U";

                  return (
                    <div
                      key={user._id}
                      className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <Avatar className="h-10 w-10 sm:h-11 sm:w-11">
                          <AvatarImage
                            src={user?.profilePicture || ""}
                            alt={name}
                          />
                          <AvatarFallback className="bg-gray-700 text-white text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                            {name}
                          </p>
                          {user?.email && (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/profile/${user._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hidden sm:inline-flex"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Профиль
                          </Button>
                        </Link>

                        <Link
                          href={`/profile/${user._id}`}
                          className="sm:hidden"
                        >
                          <Button variant="outline" size="icon">
                            <User className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              renderEmptyStub(
                "Пока нет друзей — попробуйте кого-нибудь добавить."
              )
            )}
          </section>

          {/* === БЛОК 3. Рекомендации === */}
          <section className="bg-transparent">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Кого добавить
            </h2>

            {suggestions && suggestions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {suggestions.map((friend) => (
                  <FriendsSuggestion key={friend._id} friend={friend} />
                ))}
              </div>
            ) : (
              renderEmptyStub("Пока нет рекомендаций — но скоро появятся 😊")
            )}
          </section>

          {/* === БЛОК 4. Все пользователи === */}
          <section className="bg-transparent">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Все пользователи
            </h2>

            {allUsers && allUsers.length > 0 ? (
              <div className="bg-white dark:bg-[rgb(36,37,38)] rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                {allUsers.map((user) => {
                  const name = user?.username || user?.email || "Без имени";

                  const initials =
                    name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((s) => s[0])
                      .join("")
                      .toUpperCase() || "U";

                  return (
                    <div
                      key={user._id}
                      className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <Avatar className="h-10 w-10 sm:h-11 sm:w-11">
                          <AvatarImage
                            src={user?.profilePicture || ""}
                            alt={name}
                          />
                          <AvatarFallback className="bg-gray-700 text-white text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                            {name}
                          </p>
                          {user?.email && (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/profile/${user._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hidden sm:inline-flex"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Профиль
                          </Button>
                        </Link>

                        <Link
                          href={`/profile/${user._id}`}
                          className="sm:hidden"
                        >
                          <Button variant="outline" size="icon">
                            <User className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              renderEmptyStub("Пока нет других пользователей.")
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default FriendsPage;
