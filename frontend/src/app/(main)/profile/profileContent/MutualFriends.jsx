"use client";

/**
 * Вкладка "Friends" — общие друзья с пользователем
 */

import { Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getAllMutualFriends } from "@/service/user.service";

const MutualFriends = ({ profileId }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!profileId) return;
      try {
        setLoading(true);
        const data = await getAllMutualFriends(profileId);
        setFriends(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("getAllMutualFriends error:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [profileId]);

  return (
    <Card className="border border-border bg-white/70 shadow-sm backdrop-blur dark:bg-neutral-900/60 dark:border-neutral-700">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Общие друзья
          </h2>
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground">Загружаем друзей...</p>
        )}

        {!loading && friends.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Пока общих друзей нет.
          </p>
        )}

        {!loading && friends.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {friends.map((friend) => (
              <div
                key={friend._id}
                className="flex flex-col items-center gap-2 rounded-md bg-muted/40 p-2 text-center"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={friend.profilePicture || undefined}
                    alt={friend.username}
                  />
                  <AvatarFallback>
                    {friend.username
                      ?.split(" ")
                      .map((s) => s[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="line-clamp-2 text-xs font-medium text-foreground">
                  {friend.username}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MutualFriends;
