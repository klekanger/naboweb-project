import { clientWithWriteAccess } from "@/sanity/lib/client";
import { currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
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

  await clientWithWriteAccess.createIfNotExists({
    _type: "authors",
    _id: id,
    firstName,
    lastName,
    email: emailAddresses[0].emailAddress,
  });

  const url = req.url?.split("/api/create-sanity-user")[0] || "/";
  return NextResponse.redirect(url);
};
