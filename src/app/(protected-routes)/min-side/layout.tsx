'use client';

import '@/app/globals.css';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function MyPageLayout({
  login,
  mypage,
}: {
  login: React.ReactNode;
  mypage: React.ReactNode;
}) {
  const { user, error, isLoading } = useUser();

  console.log('[MyPageLayout] user: ', user);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return user ? (
    <section className="mx-auto max-w-6xl overflow-hidden px-2 md:px-5">
      {mypage}
    </section>
  ) : (
    <section className="mx-auto max-w-6xl overflow-hidden px-2 md:px-5">
      {login}
    </section>
  );
}
