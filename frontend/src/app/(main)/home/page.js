"use client";

import LeftSideBar from "@/components/layout/LeftSideBar";
import RightSideBar from "@/components/layout/RightSideBar";
import { useEffect, useState } from "react";
import { usePostStore } from "../../store/usePostStore";
import NewPostForm from "../posts/NewPostForm";
import PostCard from "../posts/PostCard";
import StorySection from "../story/StorySection";

export default function Page() {
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [likePosts, setLikePosts] = useState(new Set());

  // ✅ posts по умолчанию — []
  const {
    posts = [],
    fetchPost,
    handleCreatePost,
    handleCommentPost,
    handleLikePost,
  } = usePostStore();

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("likePosts") : null;
    if (saved) setLikePosts(new Set(JSON.parse(saved)));
  }, []);

  const handleLike = async (postId) => {
    const updated = new Set(likePosts);
    if (updated.has(postId)) {
      updated.delete(postId);
    } else {
      updated.add(postId);
    }
    setLikePosts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("likePosts", JSON.stringify([...updated]));
    }
    try {
      await handleLikePost(postId);
      await fetchPost();
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ onComment принимает (postId, text)
  const handleAddComment = async (postId, text) => {
    try {
      await handleCommentPost(postId, text);
      await fetchPost();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="flex flex-1 pt-16 overflow-x-hidden">
        <LeftSideBar />

        <div className="flex-1 px-3 sm:px-4 py-6 md:ml-64 lg:mr-64 max-w-full">
          <div className="w-full mx-auto max-w-[100vw] sm:max-w-2xl xl:max-w-3xl">
            <StorySection />

            <NewPostForm
              isPostFormOpen={isPostFormOpen}
              setIsPostFormOpen={setIsPostFormOpen}
            />

            <div className="mt-6 space-y-6">
              {Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    isLiked={likePosts.has(post?._id)}
                    onLike={() => handleLike(post?._id)}
                    onComment={handleAddComment} // ✅
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Пока нет постов
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-64 xl:w-80 fixed right-0 top-16 bottom-0 overflow-y-auto p-4">
          <RightSideBar />
        </div>
      </main>
    </div>
  );
}
