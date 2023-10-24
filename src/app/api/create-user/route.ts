import { clerkClient } from '@clerk/nextjs';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const requestBody = request;
  const parsedBody = await requestBody.json();
  const { userToCreate, userRole } = parsedBody;

  const { userId } = getAuth(request);

  if (!userId) {
    return Response.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      }
    );
  }

  const user = await clerkClient.users.getUser(userId);
  const { roles } = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!roles.includes('admin')) {
    return Response.json(
      {
        error: 'User is not admin',
      },
      {
        status: 403,
      }
    );
  }

  try {
    const users = await clerkClient.users.getUserList({
      limit: 1,
      emailAddress: [userToCreate?.email],
    });

    if (users.length > 0) {
      return Response.json(
        {
          error: 'User already exists',
          message: `User with email ${userToCreate?.email} already exists`,
        },
        {
          status: 409,
        }
      );
    }

    return Response.json(
      {
        success: {
          message: 'User created',
          user: {
            ...userToCreate,
            publicMetadata: {
              roles: [userRole],
            },
          },
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error('Something went wrong: ', error);
    if (error instanceof Error) {
      return Response.json(
        {
          error: error.name ?? 'Unknown error',
          message: error.message,
        },
        {
          status: 500,
        }
      );
    } else {
      return Response.json(
        {
          error: 'Unknown error',
          message: error ?? 'Something is not right...',
        },
        {
          status: 500,
        }
      );
    }
  }

  // Create user with default role "user" into publicMetadata
  // https://clerk.com/docs/references/backend/user/create-user

  // Return error or success
}
