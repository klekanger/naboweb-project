import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/min-side(.*)",
  "/information(.*)",
  "/user-admin-page(.*)",
  "/messageboard(.*)",
  "/admin(.*)",
  "/email-admin(.*)",
]);

export default clerkMiddleware(
  async (auth, request) => {
    if (isProtectedRoute(request)) {
      await auth.protect();
    }

    return NextResponse.next();
  },
  { signInUrl: "/sign-in" },
);

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    // Always run on protected prefixes, even for paths with a dot (for
    // example slugs or .rsc/.segments requests), which the first entry skips.
    "/(min-side|information|user-admin-page|messageboard|admin|email-admin)(.*)",
  ],
};
