/**
 * Layout for all protected pages
 */
import "@/app/globals.css";

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
    <div className="mx-auto max-w-8xl overflow-hidden px-2 md:px-5">
      {children}
    </div>
  );
}
