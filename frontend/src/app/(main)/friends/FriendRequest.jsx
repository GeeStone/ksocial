"use client";

import useFriendsStore from "@/app/store/useFriendsStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";

const FriendRequest = ({ friend }) => {
  const { follow, removeIncomingRequest } = useFriendsStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const name = friend?.username || friend?.name || friend?.email || "Без имени";

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "U";

  const handleConfirm = async () => {
    if (!friend?._id || isProcessing) return;
    setIsProcessing(true);
    try {
      await follow(friend._id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!friend?._id || isProcessing) return;
    setIsProcessing(true);
    try {
      // удаляем входящую заявку / одностороннюю подписку
      await removeIncomingRequest(friend._id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-[rgb(36,37,38)] rounded-xl shadow-sm p-4 sm:p-5 flex flex-col items-center text-center"
      >
        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-4">
          <AvatarImage src={friend?.profilePicture || ""} alt={name} />
          <AvatarFallback className="bg-gray-700 text-white text-lg sm:text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 max-w-full truncate">
          {name}
        </h3>

        {friend?.email && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-full truncate">
            {friend.email}
          </p>
        )}

        {/* На мобиле кнопки стопкой, на sm+ — в две колонки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          <Button
            className="bg-[#2374E1] hover:bg-[#1664c4] text-white w-full"
            size="lg"
            aria-label="Подтвердить заявку в друзья"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="truncate">
              {isProcessing ? "Обработка..." : "Подтвердить"}
            </span>
          </Button>

          <Button
            variant="ghost"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-full text-gray-900 dark:text-gray-100"
            size="lg"
            aria-label="Удалить заявку в друзья"
            onClick={handleDelete}
            disabled={isProcessing}
          >
            <UserMinus className="mr-2 h-4 w-4" />
            <span className="truncate">Удалить</span>
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FriendRequest;
