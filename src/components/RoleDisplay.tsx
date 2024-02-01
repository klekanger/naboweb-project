import { Chip, type ChipProps } from "@nextui-org/chip";

type FriendlyUserRole = {
  role: string;
  friendlyName: string;
  color: ChipProps["color"];
};

export default function RoleDisplay({
  roles,
}: { roles: string[] | undefined }) {
  // Check if roles is an array
  if (!Array.isArray(roles)) {
    console.error("Error: Not able to show roles. Roles is not an array");
    return null;
  }

  const friendlyUserRoles: FriendlyUserRole[] = [
    {
      role: "admin",
      friendlyName: "Administrator",
      color: "danger",
    },
    {
      role: "editor",
      friendlyName: "Redaktør",
      color: "warning",
    },
    {
      role: "user",
      friendlyName: "Bruker",
      color: "success",
    },
  ];

  const friendlyUserRoleNames = roles?.map((role) => {
    const friendlyRole = friendlyUserRoles.find((r) => r.role === role);
    return {
      name: friendlyRole?.friendlyName ?? "Bruker",
      color: friendlyRole?.color ?? "primary",
    };
  }) ?? [
    {
      name: "Ingen tilgang",
      color: "secondary",
    },
  ];

  return (
    <div className="flex flex-row flex-wrap items-center justify-start gap-2">
      {friendlyUserRoleNames.map((role, i) => (
        <Chip key={`chip-${i}`} size="sm" color={role.color}>
          {role.name}
        </Chip>
      ))}
    </div>
  );
}
