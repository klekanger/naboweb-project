/**
 * Layout for all pages and articles - including blog posts
 */
import "@/app/globals.css";
import { AutomaticVisualEditing } from "@/components/AutomaticVisualEditing";
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/sections/Navbar";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { draftMode } from "next/headers";
import { Suspense } from "react";

export const metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default async function ArticlePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>
      <main className="flex min-h-screen flex-col mx-auto max-w-7xl px-2 sm:px-5">
        <div className="mt-4 sm:mt-8 md:mt-16 ">{children}</div>
        {(await draftMode()).isEnabled && (
          <span className=" z-50 fixed opacity-50 top-2 left-2 px-2 py-1 bg-red-500 text-white">
            DRAFT MODE
          </span>
        )}
      </main>
      <Footer />
      {(await draftMode()).isEnabled && <AutomaticVisualEditing />}
    </>
  );
}
