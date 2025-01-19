"use client";

import UserAdminProvider from "@/context/userAdminContext";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ThemeProvider attribute="class" enableSystem={true} defaultTheme="light">
        <UserAdminProvider>{children}</UserAdminProvider>
      </ThemeProvider>
    </HeroUIProvider>
  );
}
