import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];
  const hasAccess = roles.includes("admin") || roles.includes("editor");

  if (!hasAccess) redirect("/");

  return <>{children}</>;
}
