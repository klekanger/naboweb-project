import { defineLive } from "next-sanity/live";
import { client } from "./client";
// import { token } from "./token";

const token = process.env.SANITY_VIEWER_TOKEN;

if (!token) {
  throw new Error("Missing SANITY_VIEWER_TOKEN");
}

/**
 * Use defineLive to enable automatic revalidation and refreshing of your fetched content
 * Learn more: https://github.com/sanity-io/next-sanity?tab=readme-ov-file#1-configure-definelive
 */

export const { sanityFetch, SanityLive } = defineLive({
  client,
  // Required for showing draft content when the Sanity Presentation Tool is used, or to enable the Vercel Toolbar Edit Mode
  serverToken: token,
  // Required for stand-alone live previews, the token is only shared to the browser if it's a valid Next.js Draft Mode session
  browserToken: token,
});
