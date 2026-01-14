"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Tracks route changes for Plausible Analytics in Next.js App Router
 * Plausible supports SPA routing, but explicit tracking ensures accurate pageviews
 */
export default function PlausibleRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track if Plausible is loaded
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("pageview");
    }
  }, [pathname]);

  return null;
}
