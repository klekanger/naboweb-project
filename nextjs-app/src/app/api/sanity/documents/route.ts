import { currentUser } from "@clerk/nextjs/server";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

function revalidateDocs() {
  revalidateTag("fileOtherDocuments", "max");
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!roles.includes("admin") && !roles.includes("editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { title, description, tags, assetId } = await request.json();

  if (!title || !assetId) {
    return NextResponse.json({ error: "title and assetId are required" }, { status: 400 });
  }

  try {
    const result = await clientWithWriteAccess.create({
      _type: "fileOtherDocuments",
      title,
      description: description ?? "",
      tags: tags ?? [],
      otherDocument: {
        _type: "file",
        asset: { _ref: assetId, _type: "reference" },
      },
    });

    revalidateDocs();
    return NextResponse.json({ success: true, _id: result._id });
  } catch (error) {
    console.error("Document creation failed:", error);
    return NextResponse.json({ error: "Noe gikk galt ved oppretting av dokumentet." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!roles.includes("admin") && !roles.includes("editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { _id, title, description, tags, assetId } = await request.json();

  if (!_id) {
    return NextResponse.json({ error: "_id is required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { title, description, tags };

  if (assetId) {
    patch.otherDocument = {
      _type: "file",
      asset: { _ref: assetId, _type: "reference" },
    };
  }

  try {
    await clientWithWriteAccess.patch(_id).set(patch).commit();
    revalidateDocs();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document update failed:", error);
    return NextResponse.json({ error: "Noe gikk galt ved oppdatering av dokumentet." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!roles.includes("admin") && !roles.includes("editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { _id } = await request.json();

  if (!_id) {
    return NextResponse.json({ error: "_id is required" }, { status: 400 });
  }

  try {
    await clientWithWriteAccess.delete(_id);
    revalidateDocs();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document deletion failed:", error);
    return NextResponse.json({ error: "Noe gikk galt ved sletting av dokumentet." }, { status: 500 });
  }
}
