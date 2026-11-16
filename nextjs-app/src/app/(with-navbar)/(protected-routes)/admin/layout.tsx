import { CMS_ROLES, requireRoleOrRedirect } from "@/lib/requireRole";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Each admin page checks the role again, because Next.js can serve a page
  // without running this layout.
  await requireRoleOrRedirect(CMS_ROLES);

  return <>{children}</>;
}
