/**
 * Layout for protedted routes
 */
import '@/app/globals.css';

export const metadata = {
  title: 'Boligsameiet Gartnerihagen',
  description: 'Askims hyggeligste nabolag',
};

export default function MyPageLayout({
  login,
  mypage,
}: {
  login: React.ReactNode;
  mypage: React.ReactNode;
}) {
  // TODO: Replace this with a real check
  const isLoggedIn = true;

  return isLoggedIn ? (
    <section className="mx-auto max-w-6xl overflow-hidden px-2 md:px-5">
      {mypage}
    </section>
  ) : (
    <section className="mx-auto max-w-6xl overflow-hidden px-2 md:px-5">
      {login}
    </section>
  );
}
