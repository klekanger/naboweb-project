import { getClerkPrimaryEmail } from "@/lib/clerk-primary-email";
import { clerkClient } from "@clerk/nextjs/server";

const CLERK_PAGE_SIZE = 100;

/** Minimal Clerk user fields used for email subscription checks (tests use this shape). */
export type ClerkUserForEmailSubscription = {
  firstName: string | null;
  lastName: string | null;
  emailAddresses: ReadonlyArray<{ id: string; emailAddress: string }>;
  primaryEmailAddressId?: string | null;
  publicMetadata: unknown;
};

export type EmailSubscriber = {
  email: string;
  firstName: string;
  lastName: string;
};

export function isEmailSubscriber(user: ClerkUserForEmailSubscription): boolean {
  const metadata = user.publicMetadata as { emailSubscription?: boolean };
  return metadata.emailSubscription === true;
}

export function getSubscriberEmail(
  user: ClerkUserForEmailSubscription,
): string | null {
  return getClerkPrimaryEmail(user);
}

export function mapUserToEmailSubscriber(
  user: ClerkUserForEmailSubscription,
): EmailSubscriber | null {
  if (!isEmailSubscriber(user)) {
    return null;
  }

  const email = getSubscriberEmail(user);
  if (!email) {
    return null;
  }

  return {
    email,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
  };
}

export function dedupeEmailSubscribers(
  subscribers: EmailSubscriber[],
): EmailSubscriber[] {
  const seen = new Set<string>();

  return subscribers.filter((subscriber) => {
    const key = subscriber.email.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function getClerkEmailSubscribers(): Promise<EmailSubscriber[]> {
  const client = await clerkClient();
  const subscribers: EmailSubscriber[] = [];
  let offset = 0;

  while (true) {
    const { data: users } = await client.users.getUserList({
      limit: CLERK_PAGE_SIZE,
      offset,
    });

    if (users.length === 0) {
      break;
    }

    for (const user of users) {
      const subscriber = mapUserToEmailSubscriber(user);
      if (subscriber) {
        subscribers.push(subscriber);
      }
    }

    if (users.length < CLERK_PAGE_SIZE) {
      break;
    }

    offset += CLERK_PAGE_SIZE;
  }

  return dedupeEmailSubscribers(subscribers);
}
