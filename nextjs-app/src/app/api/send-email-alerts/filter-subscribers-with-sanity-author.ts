import type { EmailSubscriber } from "./get-clerk-email-subscribers";

export const SANITY_AUTHOR_EMAILS_QUERY = `
  *[_type == "authors" && defined(email) && email != ""]{
    email
  }
`;

export function normalizeSubscriberEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function buildSanityAuthorEmailSet(
  authors: ReadonlyArray<{ email?: string | null }>,
): Set<string> {
  const emails = new Set<string>();

  for (const author of authors) {
    const email = author.email?.trim();
    if (email) {
      emails.add(normalizeSubscriberEmail(email));
    }
  }

  return emails;
}

/** Keep Clerk subscribers only when a Sanity author document exists with the same email. */
export function filterSubscribersWithSanityAuthor(
  subscribers: EmailSubscriber[],
  sanityAuthorEmails: Set<string>,
): EmailSubscriber[] {
  return subscribers.filter((subscriber) =>
    sanityAuthorEmails.has(normalizeSubscriberEmail(subscriber.email)),
  );
}
