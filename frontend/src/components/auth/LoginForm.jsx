// === src/components/auth/LoginForm.jsx ===
"use client";

// Форма входа в KSocial

import { Button } from "@/components/ui/button";
import { loginUser } from "@/service/auth.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";
import AuthField from "./AuthField";

// Схема валидации для формы входа
const loginSchema = yup.object({
  email: yup
    .string()
    .email("Некорректный формат e-mail")
    .required("E-mail обязателен"),
  password: yup
    .string()
    .min(6, "Минимум 6 символов")
    .required("Пароль обязателен"),
});

const LoginForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: yupResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      const res = await loginUser(data);

      if (res?.status === "success") {
        toast.success("Вы успешно вошли в KSocial");
        router.push("/");
      } else {
        throw new Error(res?.message || "Ошибка входа");
      }
    } catch (e) {
      console.error("login error:", e);
      toast.error("Неверный e-mail или пароль");
    } finally {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <AuthField
          label="E-mail"
          type="email"
          reg={register("email")}
          error={errors.email?.message}
        />
        <AuthField
          label="Пароль"
          type="password"
          reg={register("password")}
          error={errors.password?.message}
        />

        <Button className="w-full mt-2" type="submit" disabled={isSubmitting}>
          <LogIn className="mr-2 w-4 h-4" />
          {isSubmitting ? "Входим..." : "Войти"}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
