"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Loader from "@/lib/Loader";
import { checkUserAuth, logout } from "@/service/auth.service";
import useUserStore from "../store/useUserStore";

// === ВАЖНО ===
// Header лежит в src/app/components/layout/Header.jsx
import Header from "@/components/layout/Header";

// Пути, доступные без авторизации
const PUBLIC_ROUTES = ["/login"];

export default function AuthWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const { setUser, clearUser } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    let isMounted = true;

    const fireLogout = () => {
      clearUser();
      if (isMounted) setIsAuthenticated(false);

      logout().catch((err) => {
        console.error("[AuthWrapper] Logout request failed:", err);
      });

      if (!isPublicRoute) {
        router.push("/login");
      }
    };

    const checkAuth = async () => {
      try {
        const result = await checkUserAuth();

        if (!isMounted) return;

        if (result?.isAuthenticated && result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
        } else {
          fireLogout();
        }
      } catch (error) {
        console.error("[AuthWrapper] Authentication check failed:", error);
        fireLogout();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // если публичная страница → auth не проверяем
    if (isPublicRoute) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router, isPublicRoute, clearUser, setUser]);

  if (loading) return <Loader />;

  return (
    <>
      {!isPublicRoute && isAuthenticated && <Header />}
      {(isAuthenticated || isPublicRoute) && children}
    </>
  );
}
