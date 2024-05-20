"use client";

import UserAdminProvider from "@/context/userAdminContext";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <ThemeProvider attribute="class" enableSystem={true} defaultTheme="light">
        <UserAdminProvider>{children}</UserAdminProvider>
      </ThemeProvider>
    </NextUIProvider>
  );
}
