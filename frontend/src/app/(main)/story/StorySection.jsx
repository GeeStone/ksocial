"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePostStore } from "../../store/usePostStore";
import StoryCard from "./StoryCard";

/**
 * Монохромная версия StorySection
 * - мягкая светлая тема
 * - глубокая чистая тёмная тема
 * - без цветного шума
 * - строгие границы, контрастные стрелки
 */

export default function StorySection() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const containerRef = useRef(null);
  const { story = [], fetchStoryPost } = usePostStore();

  useEffect(() => {
    fetchStoryPost();
  }, [fetchStoryPost]);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    const update = () => {
      const max = Math.max(0, c.scrollWidth - c.clientWidth);
      setMaxScroll(max);
      setScrollPosition(c.scrollLeft);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(c);

    window.addEventListener("resize", update, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [story.length]);

  const scroll = (dir) => {
    const c = containerRef.current;
    if (!c) return;

    const step = c.clientWidth * 0.7;
    c.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const c = containerRef.current;
    if (c) setScrollPosition(c.scrollLeft);
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="
          flex space-x-2 overflow-x-auto py-3 sm:py-4 no-scrollbar
          px-3 sm:px-0 w-full
          bg-transparent
          [scrollbar-width:none] [-webkit-overflow-scrolling:touch]
        "
        style={{ msOverflowStyle: "none" }}
      >
        <div className="flex space-x-2">
          <StoryCard isAddStory />

          {story?.map((s) => (
            <StoryCard story={s} key={s._id} />
          ))}
        </div>
      </div>

      {/* Стрелки */}
      {scrollPosition > 0 && (
        <Button
          variant="outline"
          size="icon"
          className="
            absolute left-2 top-1/2 -translate-y-1/2 rounded-full
            bg-white/90 dark:bg-[rgb(36,37,38)]/90
            border border-gray-300 dark:border-gray-700
            shadow-md hover:bg-white dark:hover:bg-[rgb(50,50,55)]
            hidden sm:flex
          "
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-gray-800 dark:text-gray-200" />
        </Button>
      )}

      {scrollPosition < maxScroll && (
        <Button
          variant="outline"
          size="icon"
          className="
            absolute right-2 top-1/2 -translate-y-1/2 rounded-full
            bg-white/90 dark:bg-[rgb(36,37,38)]/90
            border border-gray-300 dark:border-gray-700
            shadow-md hover:bg-white dark:hover:bg-[rgb(50,50,55)]
            hidden sm:flex
          "
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-gray-800 dark:text-gray-200" />
        </Button>
      )}

      {/* Скрываем нативный скроллбар */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
          height: 0;
          width: 0;
        }
      `}</style>
    </div>
  );
}
