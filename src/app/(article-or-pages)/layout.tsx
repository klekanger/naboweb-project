/**
 * Layout for all pages and articles - including blog posts
 */

import '@/app/globals.css';

export const metadata = {
  title: 'Boligsameiet Gartnerihagen',
  description: 'Askims hyggeligste nabolag',
};

export default function Page({ children }: { children: React.ReactNode }) {
  return <section className="px-32">{children}</section>;
}
