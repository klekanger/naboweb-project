/**
 * Root layout - for all pages
 */

import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { Montserrat, Open_Sans } from 'next/font/google';
import './globals.css';

// eslint-disable-next-line new-cap
const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
});

// eslint-disable-next-line new-cap
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata = {
  metadataBase: new URL('https://gartnerihagen-askim.no'),
  title: 'Boligsameiet Gartnerihagen',
  description: 'Askims hyggeligste nabolag',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no" className={`${openSans.variable} ${montserrat.variable}`}>
      <body>
        <Navbar />
        <main className="pt-32">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
