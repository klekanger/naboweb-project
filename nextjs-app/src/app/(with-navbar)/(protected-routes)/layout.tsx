import NotLoggedIn from "@/components/NotLoggedIn";
import { getUserWithRole, RESIDENT_ROLES } from "@/lib/requireRole";
import UserAdminProvider from "@/context/userAdminContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function ProtectedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // All users should have at least the "user" role. Each page checks the role
  // again, because Next.js can serve a page without running this layout.
  if (!(await getUserWithRole(RESIDENT_ROLES))) return <NotLoggedIn />;

  return (
    <>
      <UserAdminProvider>{children}</UserAdminProvider>
    </>
  );
}
