import { currentUser } from "@clerk/nextjs/server";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!userRoles.roles.includes("user")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const data = await request.formData();
  const messageImage = data.get("messageImage") as unknown as File;

  if (!messageImage) {
    return NextResponse.json({
      error: { message: "messageImage is required" },
      status: 400,
    });
  }

  const bytes = await messageImage.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // prevent image from being too large
  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  if (buffer.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json({
      error: {
        message: `Bildet er for stort. Maks størrelse er ${Math.floor(MAX_FILE_SIZE / 1024 / 1024).toString()} MB.`,
      },
      status: 400,
    });
  }

  // Upload the file to Sanity via the asset API
  try {
    const result = await clientWithWriteAccess.assets.upload("image", buffer, {
      filename: messageImage.name,
    });

    if (!result) {
      return NextResponse.json({
        error: { message: "Noe gikk galt ved opplasting av bildet." },
        status: 500,
      });
    }

    const id = result._id;

    return NextResponse.json({
      success: {
        message: "Image uploaded",
        imageId: id,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Noe gikk galt ved opplasting av bildet.");
    return NextResponse.json({
      error: {
        message: "Noe gikk galt ved opplasting av bildet.",
        description: error,
      },
      status: 500,
    });
  }
}
