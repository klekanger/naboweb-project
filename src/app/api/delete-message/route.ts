import { clientWithWriteAccess } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

    const isAdmin = userRoles.roles.includes("admin");

    if (!user || !userRoles.roles.includes("user") || !isAdmin) {
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

    if (user.id !== userId && !isAdmin) {
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
