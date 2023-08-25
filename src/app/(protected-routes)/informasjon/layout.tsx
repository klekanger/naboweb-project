'use client';

import '@/app/globals.css';
import { useUser } from '@auth0/nextjs-auth0/client';
import { log } from 'console';

export default function InfoPageLayout({
  loggedin,
  notloggedin,
}: {
  loggedin: React.ReactNode;
  notloggedin: React.ReactNode;
}) {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return user ? <>{loggedin}</> : <>{notloggedin}</>;
}
