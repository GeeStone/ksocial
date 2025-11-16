"use client";

/**
 * Правый сайдбар с новостным блоком.
 * Сейчас использует статический массив newsItems как заглушку.
 * Далее сюда можно подставить реальные новости (например, с Яндекса).
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ExternalLink, TrendingUp } from "lucide-react";
import { useState } from "react";

const newsItems = [
  {
    title: "Новый релиз kSocial",
    description: "Мы добавили тёмную тему и улучшили профиль пользователя.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3qmBuBERRMhoFTvvNUWw7Kr9iicoxC4c8ZQ&s",
    link: "https://yandex.ru/news",
  },
  {
    title: "Рынок IT в России",
    description: "Аналитики обсудили перспективы веб-разработки в 2025 году.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0NoNt4ECTrCIzRA6PhvyyPThBY9OUEW0-ng&s",
    link: "https://yandex.ru/news",
  },
  {
    title: "Обновление JavaScript-экосистемы",
    description:
      "Новые возможности фреймворков и инструменты для разработчиков.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShpvQJUXehm_yT1kr2WSATHaDRF88_JjWHcQ&s",
    link: "https://yandex.ru/news",
  },
  {
    title: "Карьера разработчика",
    description: "Советы по прокачке навыков и построению сильного портфолио.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaBLSbp3rFpIZ0kzoreJLN7uZqkJz0h6-RQQ&s",
    link: "https://yandex.ru/news",
  },
  {
    title: "Тренды фронтенда",
    description:
      "Дизайн-системы, компонентный подход и современный UI/UX в продакшене.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0qsC4qgsmGTJ9HnNYatRyi7GyJ7GlRMujlw&s",
    link: "https://yandex.ru/news",
  },
];

const RightSideBar = () => {
  const [showAllNews, setShowAllNews] = useState(false);

  const visibleNews = showAllNews ? newsItems : newsItems.slice(0, 3);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      // ширина и высота берутся от родителя (fixed right-0 ...),
      // здесь главное — не позволять горизонтальному переполнению
      className="hidden lg:block h-full w-full overflow-x-hidden"
      aria-label="Новостной блок"
    >
      <div className="sticky top-20 space-y-4">
        <Card className="shadow-sm border border-border/60 rounded-2xl overflow-hidden">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="flex items-center text-lg font-semibold text-foreground">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Актуальные новости
            </CardTitle>
          </CardHeader>

          <CardContent className="px-3 pb-4 pt-2">
            <ul className="space-y-4">
              {visibleNews.map((item, index) => (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-xl border border-border/60 bg-card flex flex-col overflow-hidden"
                >
                  {/* Картинка новости */}
                  <div className="w-full h-40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="block w-full h-full object-cover"
                    />
                  </div>

                  {/* Текстовая часть */}
                  <div className="px-3 pb-3 pt-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {item.description}
                    </p>

                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-sm inline-flex items-center mt-2 hover:underline"
                    >
                      Перейти к статье
                      <ExternalLink className="ml-1 h-4" />
                    </a>
                  </div>
                </motion.li>
              ))}
            </ul>

            {newsItems.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllNews((v) => !v)}
                className="mt-4 w-full text-center text-sm text-blue-600 hover:underline"
              >
                {showAllNews ? "Свернуть новости" : "Показать больше"}
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.aside>
  );
};

export default RightSideBar;
