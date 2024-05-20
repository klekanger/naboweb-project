import { Chip, type ChipProps } from "@nextui-org/chip";

type FriendlyUserRole = {
  role: string;
  friendlyName: string;
  color: ChipProps["color"];
};

export default function RoleDisplay({
  roles,
}: { roles: string[] | undefined }) {
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

  let friendlyUserRoleNames;

  if (roles && Array.isArray(roles)) {
    friendlyUserRoleNames = roles?.map((role) => {
      const friendlyRole = friendlyUserRoles.find((r) => r.role === role);

      return friendlyRole
        ? {
            name: friendlyRole?.friendlyName ?? "Bruker",
            color: friendlyRole?.color ?? "primary",
          }
        : {
            name: "unknown",
            color: "default",
          };
    });
  } else {
    friendlyUserRoleNames = [
      {
        name: "Ingen tilgang",
        color: "default",
      },
    ];
  }

  return (
    <div className="flex flex-row flex-wrap items-center justify-start gap-2">
      {friendlyUserRoleNames.map(
        (role, i) =>
          role?.name !== "unknown" && (
            <Chip
              key={`chip-${i}`}
              size="sm"
              color={role?.color as ChipProps["color"]}
            >
              {role.name}
            </Chip>
          ),
      )}
    </div>
  );
}
