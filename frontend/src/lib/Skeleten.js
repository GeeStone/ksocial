/**
 * 💀 Набор скелетонов и пустых состояний для друзей / рекомендаций
 */

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { UserX } from "lucide-react";

/**
 * Карточка-заглушка при загрузке блока "друзья / рекомендации"
 */
export const FriendCardSkeleton = () => (
  <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
    <Skeleton className="mx-auto mb-4 h-24 w-24 rounded-full" />
    <Skeleton className="mx-auto mb-2 h-4 w-3/4" />
    <Skeleton className="mb-2 h-8 w-full" />
    <Skeleton className="h-8 w-full" />
  </div>
);

/**
 * Компонент для отображения сообщения, когда нет друзей / заявок / рекомендаций
 *
 * @param {Object} props
 * @param {string} [props.text]        – заголовок (по умолчанию на русском)
 * @param {string} [props.description] – поясняющий текст
 */
export const NoFriendsMessage = ({
  text = "Пока нет друзей",
  description = "Добавьте людей, чтобы видеть их посты и истории в своей ленте.",
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="flex w-full flex-col items-center justify-center p-8 text-center"
  >
    <UserX size={64} className="mb-4 text-gray-400" />
    <h3 className="mb-2 text-2xl font-semibold">{text}</h3>
    <p className="mb-4 text-gray-500 dark:text-gray-400">{description}</p>
  </motion.div>
);
