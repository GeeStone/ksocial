"use client";
import useProfileStore from "@/app/store/useProfileStore";
import LeftSideBar from "@/components/layout/LeftSideBar";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import ProfileHeader from "../ProfileHeader";
import ProfileTabs from "../ProfileTabs";

const ProfileByIdPage = () => {
  const params = useParams();
  const userId = params?.id; // Получаем ID из URL

  const { profile, isOwner, loading, error, fetchProfile } = useProfileStore();

  useEffect(() => {
    if (userId) {
      fetchProfile(userId); // Загружаем профиль по ID пользователя
    }
  }, [userId, fetchProfile]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Левый сайдбар */}
      <LeftSideBar />
      {/* Основной контент */}
      <main className="pt-16 pb-16 md:pb-0 ml-0 md:ml-64">
        <div className="max-w-6xl mx-auto px-0 sm:px-6 lg:px-8">
          {loading && !profile && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Загружаем профиль...
            </p>
          )}

          {error && !profile && (
            <p className="py-8 text-center text-sm text-red-500">
              Не удалось загрузить профиль пользователя.
            </p>
          )}

          {profile && (
            <>
              <ProfileHeader profile={profile} isOwner={isOwner} />
              <ProfileTabs profile={profile} isOwner={isOwner} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfileByIdPage;
