import NotLoggedIn from "@/components/NotLoggedIn";
import { validRoles, validateUserRoles } from "@/lib/validateUserRoles";
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
  // Check user roles before allowing access to any of the protected routes
  // All users should have at least the "user" role
  const hasAccess = await validateUserRoles({
    requiredRoles: [validRoles.USER],
  });

  if (!hasAccess) return <NotLoggedIn />;

  return (
    <>
      <UserAdminProvider>{children}</UserAdminProvider>
    </>
  );
}
