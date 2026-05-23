import type { Image } from "sanity";

import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/utils";

/**
 * Portrett-URL for innlogget bruker sin Sanity-forfatter (Clerk-ID eller e-post).
 */
export async function getAuthorPortraitUrlForClerkUser(
  clerkId: string,
  email: string,
): Promise<string | undefined> {
  let image: Image | undefined;

  if (clerkId) {
    image = await client.fetch<Image | undefined>(
      `*[_type == "authors" && _id == $clerkId][0].authorImage`,
      { clerkId },
    );
  }

  if (!image?.asset?._ref && email.trim()) {
    image = await client.fetch<Image | undefined>(
      `*[_type == "authors" && lower(email) == lower($email)][0].authorImage`,
      { email: email.trim() },
    );
  }

  return urlForImage(image)?.width(128).height(128).fit("crop").url();
}
