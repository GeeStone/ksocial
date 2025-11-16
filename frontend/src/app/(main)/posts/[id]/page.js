// === src/app/(main)/posts/[id]/page.jsx ===
"use client";

import useUserStore from "@/app/store/useUserStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PostCard from "../PostCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const SinglePostPage = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const { user } = useUserStore();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Загрузка поста с бэкенда
  const loadPost = useCallback(
    async (withSpinner = false) => {
      if (!id) return;

      if (withSpinner) {
        setLoading(true);
        setError("");
      }

      try {
        const res = await fetch(`${API_URL}/posts/${id}`, {
          credentials: "include",
        });

        let json = null;
        try {
          json = await res.json();
        } catch {
          json = null;
        }

        console.log("GET /posts/:id response:", res.status, json);

        if (!res.ok) {
          const msgFromApi =
            (json && (json.message || json.error)) || "Ошибка загрузки поста";

          setError(res.status === 404 ? "Пост не найден" : msgFromApi);
          setPost(null);
          return;
        }

        const postFromApi = (json && (json.data || json.post)) || json || null;

        if (!postFromApi) {
          setError("Пост не найден");
          setPost(null);
        } else {
          setPost(postFromApi);
          setError("");
        }
      } catch (e) {
        console.error("Ошибка при загрузке поста:", e);
        setError("Не удалось загрузить пост");
        setPost(null);
      } finally {
        if (withSpinner) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  // Первый загрузочный запрос — со спиннером
  useEffect(() => {
    loadPost(true);
  }, [loadPost]);

  // Хэндлер лайка
  const handleLike = async (postId) => {
    try {
      await fetch(`${API_URL}/posts/likes/${postId}`, {
        method: "POST",
        credentials: "include",
      });
      // после лайка просто перезагружаем пост (без большого спиннера)
      await loadPost(false);
    } catch (e) {
      console.error("Ошибка лайка поста:", e);
    }
  };

  // Хэндлер добавления комментария
  const handleComment = async (postId, text) => {
    try {
      await fetch(`${API_URL}/posts/comments/${postId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      await loadPost(false);
    } catch (e) {
      console.error("Ошибка комментария к посту:", e);
    }
  };

  // Пока аналитику/шаринг можно не трогать
  const handleShare = () => {};

  // Вычисляем, лайкнул ли текущий пользователь этот пост
  const isLikedByCurrentUser =
    !!post &&
    !!user &&
    Array.isArray(post.likes) &&
    post.likes.some(
      (u) =>
        // likes может быть массивом ObjectId или популятед-пользователей
        String(typeof u === "string" ? u : u._id) === String(user._id)
    );

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex justify-center px-2 sm:px-4 pt-24 pb-6">
        <div className="w-full max-w-2xl flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-muted-foreground">Загрузка поста…</p>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-background text-foreground flex justify-center px-2 sm:px-4 pt-24 pb-6">
        <div className="w-full max-w-2xl flex flex-col items-center justify-center min-h-[50vh] text-center">
          <p className="text-base sm:text-lg text-muted-foreground mb-4">
            {error || "Пост не найден"}
          </p>
          <button
            onClick={() => router.back()}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Вернуться назад
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex justify-center px-2 sm:px-4 pt-24 pb-6">
      <div className="w-full max-w-2xl">
        <PostCard
          post={post}
          isLiked={isLikedByCurrentUser}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      </div>
    </main>
  );
};

export default SinglePostPage;
