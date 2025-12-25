"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ThemeProvider attribute="class" enableSystem={true} defaultTheme="light">
        {children}
      </ThemeProvider>
    </HeroUIProvider>
  );
}
