import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { clientWithWriteAccess } from "@/sanity/lib/client";

type MenuItemPatchInput = {
  title?: string;
  pageId?: string | null;
};

type SettingsPatchBody = {
  companyName?: string;
  addressLine1?: string;
  addressLine2?: string;
  companyDescription?: string;
  phone?: string;
  email?: string;
  organisationNumber?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaOgImageAssetId?: string | null;
  menuItem1?: MenuItemPatchInput;
  menuItem2?: MenuItemPatchInput;
};

function applyMenuItemPatch(
  patch: ReturnType<typeof clientWithWriteAccess.patch>,
  fieldPrefix: "menuItem1" | "menuItem2",
  input?: MenuItemPatchInput,
) {
  if (!input) return patch;

  const title = input.title ?? "";
  const hasPage = typeof input.pageId === "string" && input.pageId.length > 0;

  let next = patch.set({ [`${fieldPrefix}.title`]: title } as Record<
    string,
    string
  >);

  if (hasPage) {
    next = next.set({
      [`${fieldPrefix}.menuLink`]: {
        _type: "reference" as const,
        _ref: input.pageId as string,
      },
    } as Record<string, { _type: "reference"; _ref: string }>);
  } else {
    next = next.unset([`${fieldPrefix}.menuLink`]);
  }

  return next;
}

export async function PATCH(request: NextRequest) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!roles.includes("admin") && !roles.includes("editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.SANITY_API_WRITE_TOKEN?.trim()) {
    return NextResponse.json(
      {
        error:
          "Skrivetoken for Sanity (SANITY_API_WRITE_TOKEN) mangler. Sjekk miljøvariabler.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as SettingsPatchBody;

  try {
    let patch = clientWithWriteAccess.patch("settings").set({
      companyName: body.companyName ?? "",
      addressLine1: body.addressLine1 ?? "",
      addressLine2: body.addressLine2 ?? "",
      companyDescription: body.companyDescription ?? "",
      phone: body.phone ?? "",
      email: body.email ?? "",
      organisationNumber: body.organisationNumber ?? "",
      metaTitle: body.metaTitle ?? "",
      metaDescription: body.metaDescription ?? "",
      metaKeywords: body.metaKeywords ?? "",
    });

    patch = applyMenuItemPatch(patch, "menuItem1", body.menuItem1);
    patch = applyMenuItemPatch(patch, "menuItem2", body.menuItem2);

    if (body.metaOgImageAssetId && body.metaOgImageAssetId.length > 0) {
      patch = patch.set({
        metaOgImage: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: body.metaOgImageAssetId,
          },
        },
      });
    } else {
      patch = patch.unset(["metaOgImage"]);
    }

    await patch.commit();
    revalidateTag("settings", "max");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update failed:", error);
    return NextResponse.json(
      { error: "Noe gikk galt ved lagring av nettstedinnstillinger." },
      { status: 500 },
    );
  }
}
