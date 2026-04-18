import { currentUser } from "@clerk/nextjs/server";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

function revalidateMinutes() {
  revalidateTag("fileMeetingMinutes", "max");
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!roles.includes("admin") && !roles.includes("editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { title, description, meetingDate, meetingPlace, tags, assetIds } =
    await request.json();

  if (!title || !assetIds || assetIds.length === 0) {
    return NextResponse.json(
      { error: "title and at least one file are required" },
      { status: 400 },
    );
  }

  try {
    const result = await clientWithWriteAccess.create({
      _type: "fileMeetingMinutes",
      title,
      description: description ?? "",
      meetingDate: meetingDate ?? null,
      meetingPlace: meetingPlace ?? "",
      tags: tags ?? [],
      meetingDocuments: assetIds.map((assetId: string, i: number) => ({
        _type: "file",
        _key: `doc-${i}-${assetId}`,
        asset: { _ref: assetId, _type: "reference" },
      })),
    });

    revalidateMinutes();
    return NextResponse.json({ success: true, _id: result._id });
  } catch (error) {
    console.error("Meeting minutes creation failed:", error);
    return NextResponse.json(
      { error: "Noe gikk galt ved oppretting av referatet." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!roles.includes("admin") && !roles.includes("editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { _id, title, description, meetingDate, meetingPlace, tags, assetIds } =
    await request.json();

  if (!_id) {
    return NextResponse.json({ error: "_id is required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    title,
    description,
    meetingDate,
    meetingPlace,
    tags,
  };

  if (assetIds && assetIds.length > 0) {
    patch.meetingDocuments = assetIds.map((assetId: string, i: number) => ({
      _type: "file",
      _key: `doc-${i}-${assetId}`,
      asset: { _ref: assetId, _type: "reference" },
    }));
  }

  try {
    await clientWithWriteAccess.patch(_id).set(patch).commit();
    revalidateMinutes();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Meeting minutes update failed:", error);
    return NextResponse.json(
      { error: "Noe gikk galt ved oppdatering av referatet." },
      { status: 500 },
    );
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
    revalidateMinutes();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Meeting minutes deletion failed:", error);
    return NextResponse.json(
      { error: "Noe gikk galt ved sletting av referatet." },
      { status: 500 },
    );
  }
}
