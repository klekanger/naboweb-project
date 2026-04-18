"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Avatar, Dropdown, Label } from "@heroui/react";
import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

type UserAccountMenuProps = {
  className?: string;
  onAfterNavigate?: () => void;
};

export function UserAccountMenu({
  className,
  onAfterNavigate,
}: UserAccountMenuProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded || !user) return null;

  const initials =
    [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("") ||
    undefined;

  const avatarAlt =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Profilbilde";

  return (
    <div className={className}>
      <Dropdown>
        <Dropdown.Trigger>
          <button
            type="button"
            className="rounded-full ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
            aria-label="Konto og innlogging"
          >
            <Avatar className="h-10 w-10">
              {user.imageUrl ? (
                <Avatar.Image src={user.imageUrl} alt={avatarAlt} />
              ) : null}
              <Avatar.Fallback>
                {initials ? (
                  initials.toUpperCase()
                ) : (
                  <UserRound className="h-5 w-5" />
                )}
              </Avatar.Fallback>
            </Avatar>
          </button>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu
            aria-label="Konto"
            onAction={(key) => {
              if (key === "min-side") {
                router.push("/min-side");
                onAfterNavigate?.();
              }
              if (key === "sign-out") {
                void signOut({ redirectUrl: "/" });
              }
            }}
          >
            <Dropdown.Item id="min-side" textValue="Min side">
              <Label>Min side</Label>
            </Dropdown.Item>
            <Dropdown.Item id="sign-out" textValue="Logg ut" variant="danger">
              <Label>Logg ut</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
