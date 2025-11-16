"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  MessageCircle,
  PenLine,
  Save,
  Upload,
  UserMinus2,
  UserPlus2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import useChatStore from "@/app/store/useChatStore";
import useFriendsStore from "@/app/store/useFriendsStore";
import useProfileStore from "@/app/store/useProfileStore";
import useUserStore from "@/app/store/useUserStore";

const ProfileHeader = ({ profile, isOwner }) => {
  const [isEditProfileModal, setIsEditProfileModal] = useState(false);
  const [isEditCoverModal, setIsEditCoverModal] = useState(false);
  const [isCoverPhotoPreview, setIsCoverPhotoPreview] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");

  const router = useRouter();

  const { user } = useUserStore();
  const { follow, unfollow } = useFriendsStore();
  const { saveProfile, saveCoverPhoto } = useProfileStore();
  const { openConversationWithUser } = useChatStore();

  const username = profile?.username || "Профиль пользователя";
  const avatarUrl = profile?.profilePicture || "";
  const coverUrl = profile?.coverPhoto || "";

  const followersCount =
    typeof profile?.followerCount === "number"
      ? profile.followerCount
      : Array.isArray(profile?.followers)
      ? profile.followers.length
      : 0;

  const isFollowingNow = !!profile?.followers?.some(
    (id) => String(id) === String(user?._id)
  );

  // ===== FOLLOW / MESSAGE =====

  const handleToggleFollow = async () => {
    if (!profile?._id || !user?._id) return;

    try {
      if (isFollowingNow) {
        await unfollow(profile._id);
      } else {
        await follow(profile._id);
      }
    } catch (e) {
      console.error("toggleFollow error:", e);
      toast.error("Не удалось обновить статус дружбы");
    }
  };

  const handleOpenChat = async () => {
    if (!profile?._id || !user?._id) return;

    try {
      const conv = await openConversationWithUser(profile._id);

      if (!conv || !conv._id) {
        console.error("openConversationWithUser не вернул корректный диалог");
        toast.error("Не удалось открыть диалог");
        return;
      }

      // Переходим на страницу чата
      router.push(`/messages/${conv._id}`); // изменяем на /messages/[id]
    } catch (e) {
      console.error("openConversationWithUser error:", e);
      toast.error("Ошибка при открытии диалога");
    }
  };

  // ===== EDIT PROFILE (avatar, name, dob, gender) =====

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (!profile?._id) return;

    const formData = new FormData(e.currentTarget);

    try {
      await saveProfile(profile._id, formData);
      setIsEditProfileModal(false);
      toast.success("Профиль обновлён");
    } catch (err) {
      console.error("saveProfile error:", err);
      toast.error("Не удалось сохранить профиль");
    }
  };

  // ===== EDIT COVER =====

  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCoverPreviewUrl(url);
    setIsCoverPhotoPreview(true);
  };

  const handleSubmitCover = async (e) => {
    e.preventDefault();
    if (!profile?._id) return;

    const input = e.currentTarget.querySelector('input[type="file"]');
    const file = input?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("coverPhoto", file);

    try {
      await saveCoverPhoto(profile._id, formData);
      setIsEditCoverModal(false);
      setIsCoverPhotoPreview(false);
      setCoverPreviewUrl("");
      toast.success("Обложка обновлена");
    } catch (err) {
      console.error("saveCoverPhoto error:", err);
      toast.error("Не удалось сохранить обложку");
    }
  };

  return (
    <div className="relative">
      {/* ==== ОБЛОЖКА (без z-index) ==== */}
      <div className="relative h-40 sm:h-56 md:h-72 lg:h-80 bg-gray-300 overflow-hidden">
        {coverUrl || coverPreviewUrl ? (
          <img
            src={isCoverPhotoPreview ? coverPreviewUrl || coverUrl : coverUrl}
            alt="Обложка профиля"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-700 to-slate-900" />
        )}

        {isOwner && (
          <Button
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center z-20"
            variant="secondary"
            size="sm"
            onClick={() => setIsEditCoverModal(true)}
          >
            <Camera className="mr-2 h-4 w-4" />
            <span className="hidden md:block">Изменить обложку</span>
            <span className="md:hidden">Обложка</span>
          </Button>
        )}
      </div>

      {/* ==== АВАТАР + ИМЯ + КНОПКИ (тоже без z-index) ==== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 md:-mt-20 relative">
        <div className="flex flex-col md:flex-row items-center md:items-end md:space-x-5">
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 ring-4 ring-white dark:ring-gray-700">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white">
              {(username || "U")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((s) => s[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="mt-3 sm:mt-4 md:mt-0 text-center md:text-left flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm sm:text-base">
              {followersCount}{" "}
              {followersCount === 1 ? "подписчик" : "подписчиков"}
            </p>
          </div>

          {isOwner ? (
            <Button
              className="mt-3 md:mt-0 flex items-center gap-2"
              onClick={() => setIsEditProfileModal(true)}
            >
              <PenLine className="h-4 w-4" />
              Редактировать профиль
            </Button>
          ) : (
            <div className="mt-3 md:mt-0 flex flex-wrap gap-2 justify-center md:justify-end">
              <Button
                variant={isFollowingNow ? "outline" : "default"}
                className="flex items-center gap-2"
                onClick={handleToggleFollow}
              >
                {isFollowingNow ? (
                  <>
                    <UserMinus2 className="h-4 w-4" />
                    Удалить из друзей
                  </>
                ) : (
                  <>
                    <UserPlus2 className="h-4 w-4" />
                    Добавить в друзья
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={handleOpenChat}
              >
                <MessageCircle className="h-4 w-4" />
                Написать сообщение
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ==== МОДАЛКА: РЕДАКТИРОВАНИЕ ПРОФИЛЯ ==== */}
      <AnimatePresence>
        {isOwner && isEditProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[92vw] max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Редактирование профиля
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditProfileModal(false)}
                >
                  <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                </Button>
              </div>

              <form className="space-y-5" onSubmit={handleSubmitProfile}>
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-gray-700 mb-4">
                    <AvatarImage src={avatarUrl} alt={username} />
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white">
                      {(username || "U")
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((s) => s[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <Label
                    htmlFor="profilePicture"
                    className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    <Upload className="h-4 w-4" />
                    Изменить фото профиля
                  </Label>
                  <input
                    id="profilePicture"
                    name="profilePicture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Имя</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Введите имя"
                    defaultValue={profile?.username || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Дата рождения</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    defaultValue={
                      profile?.dateOfBirth
                        ? new Date(profile.dateOfBirth)
                            .toISOString()
                            .slice(0, 10)
                        : ""
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Пол</Label>
                  <Select
                    name="gender"
                    defaultValue={profile?.gender || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите пол" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Мужской</SelectItem>
                      <SelectItem value="female">Женский</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Сохранить изменения
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==== МОДАЛКА: РЕДАКТИРОВАНИЕ ОБЛОЖКИ ==== */}
      <AnimatePresence>
        {isOwner && isEditCoverModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[92vw] max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Изменение обложки
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditCoverModal(false)}
                >
                  <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                </Button>
              </div>

              <form className="space-y-5" onSubmit={handleSubmitCover}>
                <div className="flex flex-col items-center mb-4 w-full">
                  {isCoverPhotoPreview && coverPreviewUrl && (
                    <img
                      src={coverPreviewUrl}
                      alt="Предпросмотр обложки"
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <Label
                    htmlFor="coverPhoto"
                    className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    <Upload className="h-4 w-4" />
                    Выбрать файл обложки
                  </Label>
                  <input
                    id="coverPhoto"
                    name="coverPhoto"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverFileChange}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Сохранить обложку
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileHeader;
