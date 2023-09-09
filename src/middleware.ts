import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/blog(.*)',
    '/blog-collection(.*)',
    '/cookies-og-personvern',
    '/om-boligsameiet-gartnerihagen',
    '/styret',
    '/sign-in',
    '/sign-up',
  ],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
