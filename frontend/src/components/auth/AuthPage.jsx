// === src/components/auth/AuthPage.jsx ===
"use client";

import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import GoogleAuthButton from "./GoogleAuthButton";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

/**
 * Главная страница авторизации KSocial.
 * Отвечает только за оболочку: карточка, вкладки Вход/Регистрация,
 * а сами формы вынесены в отдельные компоненты.
 *
 * URL: /login
 */
export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyber-500 to-cyber-400 dark:from-cyber-950 dark:to-cyber-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <Card className="w-full bg-background/95 text-foreground border border-border/60 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
          {/* Заголовок карточки */}
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center tracking-tight">
              kSocial
            </CardTitle>

            <CardDescription className="text-center text-sm text-muted-foreground">
              Войдите в{" "}
              <span className="font-semibold text-cyber-500 dark:text-cyber-400">
                kSocial
              </span>{" "}
              и общайтесь с друзьями, делитесь постами и историями.
            </CardDescription>
          </CardHeader>

          {/* Основное содержимое: вкладки Вход / Регистрация */}
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted rounded-xl mb-4">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-lg"
                >
                  Вход
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-lg"
                >
                  Регистрация
                </TabsTrigger>
              </TabsList>

              {/* Вкладка "Вход" */}
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              {/* Вкладка "Регистрация" */}
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>

          {/* Низ карточки: разделитель и кнопка входа через Google */}
          <CardFooter className="flex flex-col space-y-4">
            <Divider />

            <GoogleAuthButton />
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Горизонтальный разделитель с текстом "или войдите с помощью".
 */
function Divider() {
  return (
    <div className="relative w-full flex items-center">
      <span className="flex-1 border-t border-border/70" />
      <span className="px-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        или войдите с помощью
      </span>
      <span className="flex-1 border-t border-border/70" />
    </div>
  );
}
