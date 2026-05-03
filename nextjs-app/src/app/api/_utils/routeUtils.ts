import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type UserRoles = {
  isUser: boolean;
  isAdmin: boolean;
};

export async function getCurrentUserWithRoles() {
  const user = await currentUser();
  const roles = (user?.publicMetadata as { roles?: string[] } | undefined)
    ?.roles ?? ["user"];

  const userRoles: UserRoles = {
    isUser: roles.includes("user"),
    isAdmin: roles.includes("admin"),
  };

  return { user, userRoles };
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: { message } }, { status: 401 });
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ error: { message } }, { status: 400 });
}

export function serverErrorResponse(
  message: string,
  longMessage?: unknown,
  status = 500,
) {
  return NextResponse.json(
    { error: { message, ...(longMessage ? { longMessage } : {}) } },
    { status },
  );
}
