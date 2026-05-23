import { currentUser } from "@clerk/nextjs/server";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

type ButtonUpdate = {
  text: string;
  fileId: string;
};

type DocumentMenuPatchBody = {
  documentMenuId: string;
  buttons: [ButtonUpdate, ButtonUpdate, ButtonUpdate, ButtonUpdate];
};

export async function PATCH(request: NextRequest) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!roles.includes("admin") && !roles.includes("editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: DocumentMenuPatchBody = await request.json();
  const { documentMenuId, buttons } = body;

  if (!documentMenuId || !buttons || buttons.length !== 4) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const [b1, b2, b3, b4] = buttons;

  try {
    await clientWithWriteAccess
      .patch(documentMenuId)
      .set({
        button1Text: b1.text,
        button1File: { _ref: b1.fileId, _type: "reference" },
        button2Text: b2.text,
        button2File: { _ref: b2.fileId, _type: "reference" },
        button3Text: b3.text,
        button3File: { _ref: b3.fileId, _type: "reference" },
        button4Text: b4.text,
        button4File: { _ref: b4.fileId, _type: "reference" },
      })
      .commit();

    revalidateTag("documentMenu", "max");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document menu update failed:", error);
    return NextResponse.json(
      { error: "Noe gikk galt ved lagring av dokumentmenyen." },
      { status: 500 },
    );
  }
}
