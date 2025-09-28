import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clientWithWriteAccess } from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
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

  try {
    const { userId, subscribe } = await request.json();

    if (!userId || typeof subscribe !== "boolean") {
      return NextResponse.json(
        { error: "Ugyldig forespørsel" },
        { status: 400 },
      );
    }

    const result = await clientWithWriteAccess
      .patch(userId)
      .set({
        emailSubscription: subscribe,
      })
      .commit();

    return NextResponse.json(
      {
        success: {
          message: "Message created",
          id: result?._id,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Sanity subscription update error:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere e-post-abonnement" },
      { status: 500 },
    );
  }
}
