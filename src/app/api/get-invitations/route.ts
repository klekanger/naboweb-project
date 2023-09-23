import type { UserWithRoles } from '@/lib/types';
import { clerkClient, currentUser } from '@clerk/nextjs';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const {
    publicMetadata: { roles },
  }: UserWithRoles = (await currentUser()) as UserWithRoles;

  if (!roles?.includes('admin')) {
    return NextResponse.json(
      { message: 'Uautorisert - du er ikke admin' },
      {
        status: 401,
      }
    );
  }

  const invitations = await clerkClient.invitations.getInvitationList();

  return NextResponse.json(invitations, {
    status: 200,
  });
}
