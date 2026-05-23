export type ClerkUserWithEmails = {
  emailAddresses: ReadonlyArray<{ id: string; emailAddress: string }>;
  primaryEmailAddressId?: string | null;
};

export function getClerkPrimaryEmail(user: ClerkUserWithEmails): string | null {
  const { primaryEmailAddressId, emailAddresses } = user;
  const primaryEmail = primaryEmailAddressId
    ? emailAddresses.find((address) => address.id === primaryEmailAddressId)
        ?.emailAddress
    : undefined;
  const email = (primaryEmail ?? emailAddresses[0]?.emailAddress)?.trim();

  if (!email) {
    return null;
  }

  return email;
}
