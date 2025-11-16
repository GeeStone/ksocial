"use client";

import LeftSideBar from "@/components/layout/LeftSideBar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePostStore } from "../../store/usePostStore";
import VideoCard from "./VideoCard";

/**
 * Страница с видеопостами.
 * Фильтрует все посты по mediaType === "video" и выводит отдельной лентой.
 */
const Page = () => {
  // Локальное состояние лайкнутых постов (храним id в Set)
  const [likePosts, setLikePosts] = useState(new Set());

  // Посты и экшены из zustand-стора
  const {
    posts = [],
    fetchPost,
    handleLikePost,
    handleCommentPost,
    handleSharePost,
  } = usePostStore();

  const router = useRouter();

  // Загружаем посты при монтировании страницы
  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Восстанавливаем лайки из localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLikes = localStorage.getItem("likePosts");
    if (savedLikes) {
      setLikePosts(new Set(JSON.parse(savedLikes)));
    }
  }, []);

  // Лайк / дизлайк поста
  const handleLike = async (postId) => {
    const updatedLikePost = new Set(likePosts);

    if (updatedLikePost.has(postId)) {
      updatedLikePost.delete(postId);
      toast.error("Лайк убран");
    } else {
      updatedLikePost.add(postId);
      toast.success("Пост понравился");
    }

    setLikePosts(updatedLikePost);

    // Сохраняем состояние лайков в localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "likePosts",
        JSON.stringify(Array.from(updatedLikePost))
      );
    }

    try {
      await handleLikePost(postId);
      await fetchPost(); // обновляем ленту после лайка
    } catch (error) {
      console.error(error);
      toast.error("Не удалось поставить или убрать лайк");
    }
  };

  // Назад к основному фиду
  const handleBack = () => {
    router.push("/");
  };

  // Фильтруем только видеопосты
  const videoPosts = Array.isArray(posts)
    ? posts.filter((post) => post.mediaType === "video")
    : [];

  return (
    <div className="mt-12 min-h-screen">
      <LeftSideBar />

      <main className="ml-0 md:ml-64 p-6">
        {/* Кнопка назад */}
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Назад к ленте
        </Button>

        {/* Список видеокарточек */}
        <div className="max-w-3xl mx-auto space-y-6">
          {videoPosts.map((post) => (
            <VideoCard
              key={post?._id}
              post={post}
              isLiked={likePosts.has(post?._id)}
              onLike={() => handleLike(post?._id)}
              onComment={async ({ text }) => {
                await handleCommentPost(post?._id, text);
                await fetchPost();
              }}
              onShare={async () => {
                await handleSharePost(post?._id);
                await fetchPost();
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Page;
