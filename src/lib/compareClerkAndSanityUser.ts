export function compareClerkAndSanityUser({
  clerkUser,
  sanityUser,
}: {
  clerkUser: string;
  sanityUser: string;
}) {
  return clerkUser === sanityUser;
}
