import { UserWithRoles } from "@/types/types";

export function currentUserRoles(user: UserWithRoles) {
  const roles = (user?.publicMetadata?.roles as string[]) || [];
  const isAdmin = roles.includes("admin") || false;
  const isEditor = roles.includes("editor") || false;

  return {
    isAdmin,
    isEditor,
  };
}
