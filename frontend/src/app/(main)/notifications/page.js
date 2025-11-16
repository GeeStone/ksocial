"use client";

/**
 * Страница /notifications.
 *
 * Макет:
 *  - слева: LeftSideBar
 *  - по центру: NotificationsList в том же контейнере, что и посты/сторис
 *  - справа (на десктопе): RightSideBar с новостями
 */

import LeftSideBar from "@/components/layout/LeftSideBar";
import RightSideBar from "@/components/layout/RightSideBar";
import NotificationsList from "./NotificationsList";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="flex flex-1 pt-16 overflow-x-hidden">
        {/* Левый сайдбар */}
        <LeftSideBar />

        {/* Центральная колонка */}
        <div className="flex-1 px-3 sm:px-4 py-6 md:ml-64 lg:mr-64 max-w-full">
          <div className="w-full mx-auto max-w-[100vw] sm:max-w-2xl xl:max-w-3xl space-y-4">
            <NotificationsList />
          </div>
        </div>

        {/* Правый сайдбар (новости) */}
        <div className="hidden lg:block lg:w-64 xl:w-80 fixed right-0 top-16 bottom-0 overflow-y-auto p-4">
          <RightSideBar />
        </div>
      </main>
    </div>
  );
}
