"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

import { registerUser } from "@/service/auth.service";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/** Схема валидации для регистрации */
const registerSchema = yup.object({
  username: yup.string().required("Имя обязательно"),
  email: yup
    .string()
    .email("Некорректный формат email")
    .required("Email обязателен"),
  password: yup
    .string()
    .min(6, "Минимум 6 символов")
    .required("Пароль обязателен"),
  dateOfBirth: yup.string().required("Дата рождения обязательна"),
  gender: yup
    .mixed()
    .oneOf(["male", "female", "other"], "Выберите вариант")
    .required("Укажите пол"),
});

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await registerUser(data);

      if (res?.status === "success") {
        toast.success("Аккаунт создан. Добро пожаловать в KSocial!");
        // бэкенд сразу ставит auth_token, можно переводить на главную
        router.push("/");
      } else {
        throw new Error(res?.message || "Ошибка регистрации");
      }
    } catch (e) {
      toast.error(
        e.message?.includes("существует") || e.message?.includes("exists")
          ? "Пользователь с таким email уже существует"
          : "Не удалось зарегистрироваться"
      );
    } finally {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <Field
          label="Имя"
          type="text"
          placeholder="Введите имя"
          reg={register("username")}
          error={errors.username?.message}
        />

        <Field
          label="Email"
          type="email"
          placeholder="Введите email"
          reg={register("email")}
          error={errors.email?.message}
        />

        <Field
          label="Пароль"
          type="password"
          placeholder="Придумайте пароль"
          reg={register("password")}
          error={errors.password?.message}
        />

        <Field
          label="Дата рождения"
          type="date"
          reg={register("dateOfBirth")}
          error={errors.dateOfBirth?.message}
        />

        {/* Пол */}
        <div className="space-y-1">
          <Label>Пол</Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex justify-between px-1"
              >
                {[
                  { value: "male", label: "Мужской" },
                  { value: "female", label: "Женский" },
                  { value: "other", label: "Другое" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem id={option.value} value={option.value} />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          {errors.gender && (
            <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
          )}
        </div>

        <Button className="w-full mt-1" type="submit" disabled={isSubmitting}>
          <LogIn className="mr-2 w-4 h-4" />
          {isSubmitting ? "Создаём аккаунт..." : "Зарегистрироваться"}
        </Button>
      </div>
    </form>
  );
}

/** Простой инпут с подписью и ошибкой */
function Field({ label, type, reg, error, placeholder }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder} {...reg} />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
