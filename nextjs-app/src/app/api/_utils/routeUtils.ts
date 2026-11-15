import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type UserRoles = {
  isUser: boolean;
  isAdmin: boolean;
  isEditor: boolean;
};

export async function getCurrentUserWithRoles() {
  const user = await currentUser();
  const roles = (user?.publicMetadata as { roles?: string[] } | undefined)
    ?.roles ?? ["user"];

  const userRoles: UserRoles = {
    isUser: roles.includes("user"),
    isAdmin: roles.includes("admin"),
    isEditor: roles.includes("editor"),
  };

  return { user, userRoles };
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: { message } }, { status: 401 });
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ error: { message } }, { status: 400 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: { message } }, { status: 403 });
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json({ error: { message } }, { status: 404 });
}

export function conflictResponse(message: string) {
  return NextResponse.json({ error: { message } }, { status: 409 });
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

type SanityAdminEditorAuth =
  | { errorResponse: NextResponse }
  | {
      clerkUserId: string;
      isAdmin: boolean;
      roles: string[];
      user: NonNullable<Awaited<ReturnType<typeof currentUser>>>;
    };

export async function getSanityAdminEditorAuth(): Promise<SanityAdminEditorAuth> {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!user?.id || (!roles.includes("admin") && !roles.includes("editor"))) {
    return {
      errorResponse: simpleErrorResponse("unauthorized", 401),
    };
  }

  return {
    clerkUserId: user.id,
    isAdmin: roles.includes("admin"),
    roles,
    user,
  };
}

export function simpleErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function simpleSuccessResponse(data: Record<string, unknown> = {}) {
  return NextResponse.json({ success: true, ...data });
}
