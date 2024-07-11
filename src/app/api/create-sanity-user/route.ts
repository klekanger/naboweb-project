import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { NextApiRequest } from "next";

export const GET = async (req: NextApiRequest) => {
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user) {
    return NextResponse.redirect("/sign-in");
  }

  if (!userRoles.roles.includes("user")) {
    console.error("User has not been assigned the 'user' role.");
    return NextResponse.redirect("/");
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
