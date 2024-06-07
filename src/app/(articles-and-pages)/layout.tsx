/**
 * Layout for all pages and articles - including blog posts
 */
import "@/app/globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Boligsameiet Gartnerihagen",
  description: "Askims hyggeligste nabolag",
};

export default function ArticlePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex min-h-screen flex-col mx-auto max-w-7xl px-2 sm:px-5">
        <Navbar />
        <div className="mt-4 sm:mt-8 md:mt-16 container">{children}</div>
      </main>
      <Footer />
    </>
  );
}
