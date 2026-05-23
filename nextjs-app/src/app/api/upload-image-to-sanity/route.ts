import { currentUser } from "@clerk/nextjs/server";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = await currentUser();
  const roles =
    (user?.publicMetadata as { roles?: string[] } | undefined)?.roles ?? [];

  if (!roles.includes("user")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const data = await request.formData();
  const messageImage = data.get("messageImage") as unknown as File | null;
  const messageImageTitle = (data.get("title") as string | null) ?? "";

  if (!messageImage || typeof messageImage === "string") {
    return NextResponse.json(
      { error: { message: "messageImage is required" } },
      { status: 400 },
    );
  }

  const bytes = await messageImage.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  if (buffer.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: {
          message: `Bildet er for stort. Maks størrelse er ${Math.floor(MAX_FILE_SIZE / 1024 / 1024).toString()} MB.`,
        },
      },
      { status: 400 },
    );
  }

  // Raw HEIC must not reach Sanity (422 on unsupported codecs). The app converts
  // in the browser first; reject only when the client still sends image/heic|heif.
  if (/^image\/(heic|heif)$/i.test(messageImage.type)) {
    return NextResponse.json(
      {
        error: {
          message:
            "HEIC kan ikke lastes opp direkte. Oppdater siden og prøv igjen, eller velg JPG/WEBP.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await clientWithWriteAccess.assets.upload("image", buffer, {
      filename: messageImage.name,
      title: messageImageTitle,
    });

    if (!result?._id) {
      return NextResponse.json(
        { error: { message: "Noe gikk galt ved opplasting av bildet." } },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: {
        message: "Image uploaded",
        imageId: result._id,
      },
    });
  } catch (error) {
    console.error("Noe gikk galt ved opplasting av bildet.");
    return NextResponse.json(
      {
        error: {
          message: "Noe gikk galt ved opplasting av bildet.",
          description: error,
        },
      },
      { status: 500 },
    );
  }
}
