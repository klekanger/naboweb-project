/**
 * Root layout - for all pages
 */

import { Providers } from "@/app/providers";
import { nbNO } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <Providers>{children}</Providers>
        </body>
      </ClerkProvider>
    </html>
  );
}
