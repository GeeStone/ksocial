"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import useProfileStore from "@/app/store/useProfileStore";

/**
 * Модалка редактирования расширенной информации (BIO)
 */

const EditBio = ({ isOpen, onClose }) => {
  const { profile, saveBio } = useProfileStore();

  const [formData, setFormData] = useState({
    bioText: "",
    liveIn: "",
    relationship: "",
    workplace: "",
    education: "",
    phone: "",
    hometown: "",
  });

  useEffect(() => {
    const bio = profile?.bio || {};
    setFormData({
      bioText: bio.bioText || "",
      liveIn: bio.liveIn || "",
      relationship: bio.relationship || "",
      workplace: bio.workplace || "",
      education: bio.education || "",
      phone: bio.phone || "",
      hometown: bio.hometown || "",
    });
  }, [profile, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?._id) return;

    await saveBio(profile._id, formData);
    onClose(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактирование информации профиля</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="bioText">О себе</Label>
            <Textarea
              id="bioText"
              name="bioText"
              placeholder="Расскажите о себе..."
              value={formData.bioText}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="liveIn">Город проживания</Label>
            <Input
              id="liveIn"
              name="liveIn"
              value={formData.liveIn}
              onChange={handleChange}
              placeholder="Например: Мурманск"
            />
          </div>

          <div>
            <Label htmlFor="relationship">Статус отношений</Label>
            <Input
              id="relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              placeholder="Например: в отношениях"
            />
          </div>

          <div>
            <Label htmlFor="workplace">Место работы</Label>
            <Input
              id="workplace"
              name="workplace"
              value={formData.workplace}
              onChange={handleChange}
              placeholder="Компания / должность"
            />
          </div>

          <div>
            <Label htmlFor="education">Образование</Label>
            <Input
              id="education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              placeholder="Вуз / курсы"
            />
          </div>

          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 ..."
            />
          </div>

          <div>
            <Label htmlFor="hometown">Родной город</Label>
            <Input
              id="hometown"
              name="hometown"
              value={formData.hometown}
              onChange={handleChange}
              placeholder="Например: Мурманск"
            />
          </div>

          <Button type="submit" className="flex w-full items-center gap-2">
            <Save className="h-4 w-4" />
            Сохранить
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBio;
