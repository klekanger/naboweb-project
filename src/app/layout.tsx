/**
 * Root layout - for all pages
 */

import Navbar from '@/components/navbar';
import { Montserrat, Open_Sans } from 'next/font/google';
import './globals.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata = {
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
      </body>
    </html>
  );
}
