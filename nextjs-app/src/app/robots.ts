import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/sign-in",
          "/sign-up",
          "/messageboard",
          "/min-side",
          "/information",
          "/email-admin",
          "/user-admin-page",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
