// src/app/(main)/profile/ProfileDetails.jsx
"use client";

/**
 * Блок «Информация / О себе» на странице профиля.
 */

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  PhoneCall,
  Rss,
} from "lucide-react";
import EditBio from "./profileContent/EditBio";

const ProfileDetails = ({ profile, isOwner }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!profile) return null;

  const bio = profile.bio || {};

  const rows = [
    {
      icon: <MapPin className="h-4 w-4" />,
      label: "Живёт в",
      value: bio.liveIn,
    },
    {
      icon: <Heart className="h-4 w-4" />,
      label: "Семейное положение",
      value: bio.relationship,
    },
    {
      icon: <Home className="h-4 w-4" />,
      label: "Родом из",
      value: bio.hometown,
    },
    {
      icon: <Briefcase className="h-4 w-4" />,
      label: "Работает в",
      value: bio.workplace,
    },
    {
      icon: <GraduationCap className="h-4 w-4" />,
      label: "Образование",
      value: bio.education,
    },
    {
      icon: <PhoneCall className="h-4 w-4" />,
      label: "Телефон",
      value: bio.phone,
    },
  ];

  const followerCount =
    typeof profile.followerCount === "number"
      ? profile.followerCount
      : profile.followers?.length || 0;

  const hasAnyRow = rows.some((r) => r.value);

  return (
    <>
      <Card className="border border-border bg-white/90 shadow-sm backdrop-blur dark:bg-neutral-900/70 dark:border-neutral-700">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base font-semibold">
            <span>Информация</span>
            {isOwner && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => setIsEditOpen(true)}
              >
                Редактировать информацию
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          {/* Краткое описание профиля */}
          <p className="text-muted-foreground">
            Это профиль{" "}
            <span className="font-semibold text-foreground">
              {profile.username || "пользователя"}
            </span>
            .
          </p>

          {/* Подписчики / наблюдатели */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Rss className="h-4 w-4" />
            <span>
              За профилем следят{" "}
              <span className="font-semibold text-foreground">
                {followerCount}
              </span>{" "}
              человек(а)
            </span>
          </div>

          {/* Строки BIO */}
          <div className="mt-2 space-y-2">
            {rows.map(
              (row, idx) =>
                row.value && (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <span className="mt-[2px] text-foreground/80">
                      {row.icon}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">
                        {row.label}
                      </span>{" "}
                      <span>{row.value}</span>
                    </span>
                  </div>
                )
            )}

            {!hasAnyRow && (
              <p className="text-xs text-muted-foreground">
                Информация о себе пока не заполнена.
                {isOwner &&
                  " Нажмите «Редактировать информацию», чтобы добавить детали."}
              </p>
            )}
          </div>

          {/* Текст «О себе» */}
          {bio.bioText && (
            <div className="mt-3 rounded-md bg-muted/60 px-3 py-2 text-sm text-foreground">
              {bio.bioText}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модалка редактирования BIO */}
      {isOwner && (
        <EditBio
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          profile={profile}
        />
      )}
    </>
  );
};

export default ProfileDetails;
