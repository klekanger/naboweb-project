import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/min-side(.*)",
  "/informasjon(.*)",
  "/user-admin-page(.*)",
  "/messageboard(.*)",
]);

export default clerkMiddleware(
  (auth, request) => {
    if (isProtectedRoute(request)) {
      auth().protect();
    }

    return NextResponse.next();
  },
  { signInUrl: "/sign-in" },
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
