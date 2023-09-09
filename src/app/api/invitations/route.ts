import { clerkClient, currentUser } from '@clerk/nextjs';
import { User } from '@clerk/nextjs/dist/types/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type UserRoles = 'admin' | 'editor' | 'user';

export async function GET(request: NextRequest, response: NextResponse) {
  const publicKey = process.env.NEXT_PUBLIC_CLERK_PUBLIC_KEY;
  console.log('publicKey', publicKey);

  const cookieStore = cookies();
  const sessToken = cookieStore.get('__session');
  const token = request.headers.get('authorization');

  if (sessToken === undefined && token === undefined) {
    return NextResponse.json(
      { message: 'Uautorisert - du har ikke tilgang' },
      {
        status: 401,
      }
    );
  }

  let authorizationHeader = request.headers.get('authorization');
  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    authorizationHeader = authorizationHeader.slice('Bearer '.length);
  }

  if (!authorizationHeader) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  // Verify the access token
  try {
    let decoded = '';
    if (token) {
      decoded = jwt.verify(token, publicKey);
      console.log('verified token', decoded);
      return NextResponse.json({ sessToken: decoded }, { status: 200 });
    } else {
      decoded = jwt.verify(sessToken, publicKey);
      console.log('verified session token', decoded);
      return NextResponse.json({ sessToken: decoded }, { status: 200 });
    }
  } catch (error) {
    console.error('Noe gikk galt... ', error);
    return NextResponse.json(
      { message: 'Uautorisert - du har ikke tilgang' },
      {
        status: 401,
      }
    );
  }

  const {
    publicMetadata: { roles },
  }: { publicMetadata: { roles: UserRoles } } =
    (await currentUser()) as User & { publicMetadata: { roles: UserRoles } };

  if (!roles.includes('admin')) {
    return NextResponse.json(
      { message: 'Uautorisert - du er ikke admin' },
      {
        status: 401,
      }
    );
  }

  const users = await clerkClient.users.getUserList();
  const invitations = await clerkClient.invitations.getInvitationList();

  return NextResponse.json(
    { invitations, users },
    {
      status: 200,
    }
  );
}
