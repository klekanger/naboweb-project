/**
 * Root layout - for all pages
 */

import { Providers } from "@/app/providers";
import { nbNO } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { SanityLive } from "@/sanity/lib/live";
import { handleError } from "./client-utils";
import { draftMode } from "next/headers";
import { Toaster } from "sonner";
import { VisualEditing } from "next-sanity";
import DraftModeToast from "@/components/DraftModeToast";

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <html
      lang="no"
      className={`${openSans.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <ClerkProvider
        dynamic
        localization={nbNO}
        appearance={{
          variables: {
            colorPrimary: "#005600",
          },
        }}
      >
        <body>
          <Providers>
            {/* The <Toaster> component is responsible for rendering toast notifications used in /app/client-utils.ts and /app/components/DraftModeToast.tsx */}
            <Toaster />
            {isDraftMode && (
              <>
                <DraftModeToast />
                {/*  Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
                <VisualEditing />
              </>
            )}

            {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should always be rendered. */}
            <SanityLive onError={handleError} />
          </Providers>
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
