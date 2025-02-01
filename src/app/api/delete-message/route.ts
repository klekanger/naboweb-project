import { clientWithWriteAccess } from "@/sanity/lib/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({
        error: { message: "Unauthorized" },
        status: 401,
      });
    }

    const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];
    const isAdmin = userRoles.roles.includes("admin");
    const isUser = userRoles.roles.includes("user");

    // Allow access if user is admin OR has user role
    if (!(isAdmin || isUser)) {
      return NextResponse.json({
        error: { message: "Unauthorized" },
        status: 401,
      });
    }

    const { id, userId } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: { message: "Message ID is required" } },
        { status: 400 },
      );
    }

    // Allow admins to delete any message, but regular users can only delete their own
    if (!(isAdmin || user.id !== userId)) {
      return NextResponse.json({
        error: {
          message: "Unauthorized (user can only delete their own messages)",
        },
        status: 401,
      });
    }

    // Delete the message from Sanity
    await clientWithWriteAccess.delete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: { message: error?.message ?? "Failed to delete message" } },
      { status: 500 },
    );
  }
}
