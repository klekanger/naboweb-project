/**
 * Layout for all pages and articles - including blog posts
 */
import '@/app/globals.css';

export const metadata = {
  title: 'Boligsameiet Gartnerihagen',
  description: 'Askims hyggeligste nabolag',
};

export default function ArticlePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl overflow-hidden px-2 md:px-5">
      {children}
    </section>
  );
}
