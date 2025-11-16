"use client";

import { usePostStore } from "@/app/store/usePostStore";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import MutualFriends from "./profileContent/MutualFriends";
import PostsContent from "./profileContent/PostsContent";
import ProfileDetails from "./ProfileDetails";

const ProfileTabs = ({ profile, isOwner }) => {
  const [activeTab, setActiveTab] = useState("posts");

  const { userPosts, fetchUserPost, loading } = usePostStore();

  // Загружаем посты пользователя при открытии профиля
  useEffect(() => {
    if (profile?._id) {
      fetchUserPost(profile._id); // Обеспечиваем, что посты загружаются только для конкретного профиля
    }
  }, [profile?._id, fetchUserPost]);

  const renderPosts = () => {
    if (loading && !userPosts.length) {
      return (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Загружаем публикации...
        </p>
      );
    }

    if (!userPosts.length) {
      return (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {isOwner
            ? "У вас пока нет публикаций. Создайте первый пост на главной ленте."
            : "У этого пользователя пока нет публикаций."}
        </p>
      );
    }

    // Фильтрация репостов
    const filteredPosts = userPosts.filter((post) => {
      return post.isRepost ? post.shares.includes(profile._id) : true;
    });

    return (
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <PostsContent key={post._id} post={post} />
        ))}
      </div>
    );
  };

  return (
    <section className="mt-4 md:mt-6">
      <Card className="border-none bg-transparent shadow-none">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-11 flex justify-start items-center gap-1 overflow-x-auto overflow-y-hidden bg-transparent p-0 border-b border-border rounded-none">
            <TabsTrigger
              value="posts"
              className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Посты
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              О себе
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Мои друзья
            </TabsTrigger>
            <TabsTrigger
              value="photos"
              className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Мои фото
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="pt-4">
            <div className="md:grid md:grid-cols-[minmax(0,2.1fr)_minmax(260px,1fr)] md:gap-4">
              <div>{renderPosts()}</div>
              <div className="mt-4 md:mt-0">
                <ProfileDetails profile={profile} isOwner={isOwner} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="pt-4">
            <div className="max-w-2xl space-y-4">
              <ProfileDetails profile={profile} isOwner={isOwner} />
            </div>
          </TabsContent>

          <TabsContent value="friends" className="pt-4">
            <MutualFriends profile={profile} isOwner={isOwner} />
          </TabsContent>

          <TabsContent value="photos" className="pt-4">
            <p className="py-6 text-center text-sm text-muted-foreground">
              Раздел «Фото» пока в разработке.
            </p>
          </TabsContent>
        </Tabs>
      </Card>
    </section>
  );
};

export default ProfileTabs;
