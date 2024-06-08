import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/(protected-routes)(.*)']);

      export default clerkMiddleware((auth, request) => {
        if (isProtectedRoute(request)) {
          auth().protect();
        }

        return NextResponse.next();
      });

      export const config = {
        matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
      };


/* import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/blog(.*)",
    "/blog-collection(.*)",
    "/cookies-og-personvern",
    "/om-boligsameiet-gartnerihagen",
    "/styret",
    "/sign-in",
    "/sign-up",
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
 */