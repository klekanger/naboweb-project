import NotLoggedIn from "@/components/NotLoggedIn";
import { validRoles, validateUserRoles } from "@/lib/validateUserRoles";
import UserAdminProvider from "@/context/userAdminContext";

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
