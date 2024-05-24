/**
 * Root layout - for all pages
 */

import { Providers } from "@/app/providers";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { nbNO } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL("https://gartnerihagen-askim.no"),
  title: "Boligsameiet Gartnerihagen",
  description: "Askims hyggeligste nabolag",
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
      <ClerkProvider localization={nbNO}>
        <body>
          <Providers>
            <main className="flex min-h-screen flex-col ">
              <Navbar />
              <div className="mt-4 sm:mt-8 md:mt-16 container">{children}</div>
            </main>
            <Footer />
          </Providers>
        </body>
      </ClerkProvider>
    </html>
  );
}
