import { client, clientWithWriteAccess } from "@/sanity/lib/client";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

// GET handler: Check if user exists in Sanity on login, create if not
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    const userRoles = user?.publicMetadata as { roles: string[] };
    const requestUrl = new URL(req.nextUrl);

    if (!user || !userRoles) {
      console.error("User not logged in or missing roles");
      return NextResponse.redirect(new URL("/sign-in", requestUrl));
    }

    if (!("roles" in userRoles)) {
      console.error("Roles array is missing from userRoles");
      return NextResponse.redirect(new URL("/", requestUrl));
    }

    if (!userRoles.roles.includes("user")) {
      console.error("User has not been assigned the 'user' role by admin.");
      return NextResponse.redirect(new URL("/", requestUrl));
    }

    const { id, firstName, lastName, emailAddresses } = user;

    // Validate email exists
    if (!emailAddresses || emailAddresses.length === 0) {
      console.error("User has no email addresses");
      return NextResponse.redirect(new URL("/", requestUrl));
    }

    // Check if the Clerk user exists in Sanity with the same ID
    const existingUser = await client.fetch(
      `*[_type == "authors" && _id == $id][0]`,
      { id },
    );

    // If the user doesn't exist in Sanity, create it
    if (!existingUser) {
      await clientWithWriteAccess.createIfNotExists({
        _type: "authors",
        _id: id,
        firstName: firstName || "",
        lastName: lastName || "",
        email: emailAddresses[0].emailAddress,
      });
    }

    const url = req.url?.split("/api/create-sanity-user")[0] || "/";
    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error("Error checking/creating Sanity user (GET):", error);
    const requestUrl = new URL(req.nextUrl);
    return NextResponse.redirect(new URL("/", requestUrl));
  }
}

// POST handler: Called after creating users via the user admin interface
export async function POST(request: Request) {
  try {
    // 1) Get the current user from Clerk
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 },
      );
    }

    // 2) Check if this user has a user role of "admin"
    const userRoles = (user.publicMetadata as { roles: string[] }) ?? {
      roles: [],
    };

    if (!userRoles.roles || !userRoles.roles.includes("admin")) {
      return NextResponse.json(
        { error: { message: "Unauthorized - admin role required" } },
        { status: 401 },
      );
    }

    // 3) If admin, continue creating a Sanity user with the same ID as the newly created Clerk user

    const { id, firstName, lastName, email } = await request.json();

    // Input validation: Check required fields
    if (!id || !firstName || !lastName || !email) {
      return NextResponse.json(
        {
          error: {
            message: "Missing required fields: id, firstName, lastName, email",
          },
        },
        { status: 400 },
      );
    }

    // Input validation: Validate types and formats
    if (
      typeof id !== "string" ||
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string"
    ) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid field types",
          },
        },
        { status: 400 },
      );
    }

    // Input validation: Validate ID format (Clerk user IDs start with "user_")
    if (!id.startsWith("user_") || id.length > 100) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid user ID format",
          },
        },
        { status: 400 },
      );
    }

    // Input validation: Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid email format",
          },
        },
        { status: 400 },
      );
    }

    // Input validation: Validate string lengths
    if (firstName.length > 100 || lastName.length > 100 || email.length > 255) {
      return NextResponse.json(
        {
          error: {
            message: "Field length exceeds maximum allowed",
          },
        },
        { status: 400 },
      );
    }

    // Security: Verify the user exists in Clerk and data matches
    const clerk = await clerkClient();
    let clerkUser;
    try {
      clerkUser = await clerk.users.getUser(id);
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            message: "User not found in Clerk",
          },
        },
        { status: 404 },
      );
    }

    // Security: Validate provided data matches Clerk user data
    const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress;
    if (
      !clerkEmail ||
      clerkEmail !== email ||
      clerkUser.firstName !== firstName ||
      clerkUser.lastName !== lastName
    ) {
      return NextResponse.json(
        {
          error: {
            message: "Provided data does not match Clerk user",
          },
        },
        { status: 400 },
      );
    }

    await clientWithWriteAccess.createIfNotExists({
      _type: "authors",
      _id: id,
      firstName,
      lastName,
      email,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error creating Sanity user:", error);
    return NextResponse.json(
      {
        error: {
          message: error?.message ?? "Failed to create Sanity user",
        },
      },
      { status: 500 },
    );
  }
}
