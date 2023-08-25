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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return user ? <>{mypage}</> : <>{login}</>;
}
