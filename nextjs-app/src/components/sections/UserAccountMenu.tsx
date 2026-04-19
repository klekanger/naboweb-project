"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Avatar, Dropdown, Label } from "@heroui/react";
import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type UserAccountMenuProps = {
  className?: string;
  onAfterNavigate?: () => void;
};

/** Initials from name, else email local-part, else username. */
function getUserInitials(
  user: NonNullable<ReturnType<typeof useUser>["user"]>,
) {
  const a = user.firstName?.trim().charAt(0);
  const b = user.lastName?.trim().charAt(0);
  if (a && b) return `${a}${b}`.toUpperCase();
  if (a) return a.toUpperCase();
  if (b) return b.toUpperCase();

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress;
  if (email) {
    const local = email.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "") ?? "";
    if (local.length >= 2) return local.slice(0, 2).toUpperCase();
    if (local.length === 1) return local.toUpperCase();
  }

  const username = user.username?.trim();
  if (username) return username.slice(0, 2).toUpperCase();

  return undefined;
}

export function UserAccountMenu({
  className,
  onAfterNavigate,
}: UserAccountMenuProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded || !user) return null;

  const initials = getUserInitials(user);
  const imageUrl = user.imageUrl;
  const showProfileImage = Boolean(imageUrl);

  const avatarAlt =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Profilbilde";

  const remountKey = [
    user.id,
    imageUrl ?? "",
    user.firstName ?? "",
    user.lastName ?? "",
    user.primaryEmailAddress?.emailAddress ?? "",
  ].join("|");

  const userIcon = (
    <UserRound className="h-5 w-5 text-brand-black" />
  );
  const initialsOrIcon: ReactNode = initials ?? userIcon;

  const initialsMarkup = (
    <span
      key={`${remountKey}|initials`}
      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-brand-black"
    >
      {initialsOrIcon}
    </span>
  );

  return (
    <div className={className}>
      <Dropdown>
        <Dropdown.Trigger>
          <span
            className="inline-flex rounded-full ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
            aria-label="Konto og innlogging"
          >
            {showProfileImage ? (
              <Avatar
                key={`${remountKey}|img`}
                className="h-10 w-10 cursor-pointer"
              >
                <Avatar.Image src={imageUrl} alt={avatarAlt} />
                <Avatar.Fallback className="text-xs font-semibold text-brand-black">
                  {initialsOrIcon}
                </Avatar.Fallback>
              </Avatar>
            ) : (
              initialsMarkup
            )}
          </span>
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
