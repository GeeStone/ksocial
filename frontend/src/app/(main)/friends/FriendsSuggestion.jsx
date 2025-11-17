"use client";

import useFriendsStore from "@/app/store/useFriendsStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useState } from "react";

const FriendsSuggestion = ({ friend }) => {
  const { follow } = useFriendsStore();
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

  const handleAddFriend = async () => {
    if (!friend?._id || isProcessing) return;
    setIsProcessing(true);
    try {
      await follow(friend._id);
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
        className="bg-gradient-to-r from-green-500 to-yellow-500 rounded-xl shadow-lg p-4 sm:p-5 flex flex-col items-center text-center transform transition-all duration-300 ease-in-out hover:scale-105"
      >
        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-4 shadow-md hover:shadow-xl">
          <AvatarImage src={friend?.profilePicture || ""} alt={name} />
          <AvatarFallback className="bg-gray-700 text-white text-lg sm:text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h3 className="text-base sm:text-lg font-semibold text-white mb-1 max-w-full truncate">
          {name}
        </h3>

        {friend?.email && (
          <p className="text-xs sm:text-sm text-gray-100 mb-4 max-w-full truncate">
            {friend.email}
          </p>
        )}

        <Button
          className="bg-[#2374E1] hover:bg-[#1664c4] text-white w-full transition-transform transform hover:scale-105"
          size="lg"
          aria-label="Добавить в друзья"
          onClick={handleAddFriend}
          disabled={isProcessing}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          <span className="truncate">
            {isProcessing ? "Отправка..." : "Добавить в друзья"}
          </span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default FriendsSuggestion;
