"use client";

import { useApp } from "@/context/app-context";
import { LoginScreen } from "@/components/login-screen";
import { AppLayout } from "@/components/app-layout";

export default function Page() {
  const { isAuthenticated } = useApp();

  return isAuthenticated ? <AppLayout /> : <LoginScreen />;
}
