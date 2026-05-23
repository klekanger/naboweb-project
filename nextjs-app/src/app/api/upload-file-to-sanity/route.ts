import { currentUser } from "@clerk/nextjs/server";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(request: NextRequest) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!roles.includes("admin") && !roles.includes("editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const data = await request.formData();
  const file = data.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (buffer.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `Filen er for stor. Maks størrelse er ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
      { status: 400 },
    );
  }

  try {
    const result = await clientWithWriteAccess.assets.upload("file", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      assetId: result._id,
      url: result.url,
      originalFilename: result.originalFilename,
    });
  } catch (error) {
    console.error("File upload failed:", error);
    return NextResponse.json(
      { error: "Noe gikk galt ved opplasting av filen." },
      { status: 500 },
    );
  }
}
