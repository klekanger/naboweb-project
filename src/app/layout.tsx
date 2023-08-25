/**
 * Root layout - for all pages
 */

import { Providers } from '@/app/providers';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { UserProvider } from '@auth0/nextjs-auth0/client';
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
      <UserProvider>
        <body>
          <Providers>
            <main className="flex min-h-screen flex-col">
              <Navbar />
              <section className="mt-16 sm:mt-32">{children}</section>
            </main>
            <Footer />
          </Providers>
        </body>
      </UserProvider>
    </html>
  );
}
