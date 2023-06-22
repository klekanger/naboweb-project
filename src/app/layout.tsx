import Navbar from '@/components/navbar';
import './globals.css';

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
    <html lang="no">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
