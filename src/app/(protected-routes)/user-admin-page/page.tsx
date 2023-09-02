// import { useUser } from '@auth0/nextjs-auth0/client';
import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from '@auth0/nextjs-auth0';
import { ManagementClient } from 'auth0';
const {
  JwtVerifier,
  JwtVerifierError,
  getTokenFromHeader,
} = require('@serverless-jwt/jwt-verifier');

// const jwt = require('jsonwebtoken');

// Mock userList
const userList = [
  {
    id: '123',
    email: '9h0Kt@example.com',
    name: 'Test User',
  },
  {
    id: '456',
    email: '9h0Kt@example.com',
    name: 'Test User 2',
  },
  {
    id: '789',
    email: '9h0Kt@example.com',
    name: 'Test User 3',
  },
];

const userRoles = [
  {
    role: 'admin',
    friendlyName: 'Administrator',
    color: 'danger',
  },
  {
    role: 'editor',
    friendlyName: 'Redaktør',
    color: 'warning',
  },
  {
    role: 'user',
    friendlyName: 'Bruker',
    color: 'success',
  },
];

const opts = {
  audience: 'https://useradmin.gartnerihagen-askim.no',
  scope: 'read:users read:roles read:role_members',
};

async function getData() {
  const user = await getSession();
  // console.log('user: ', user);
  const token = user?.accessToken || '';

  const jwt = new JwtVerifier({
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    audience: `https://${process.env.AUTH0_USERADMIN_AUDIENCE}/   `,
  });

  let claims, permissions;

  try {
    claims = await jwt.verifyAccessToken(token);
    permissions = claims.permissions || [];

    console.log('claims ', claims);
  } catch (error) {
    console.error('Shit happened: ', error);
  }

  return { userRoles, userList };

  const auth0 = new ManagementClient({
    domain: `${process.env.AUTH0_DOMAIN}`,
    clientId: `${process.env.AUTH0_BACKEND_CLIENT_ID}`,
    clientSecret: `${process.env.AUTH0_BACKEND_CLIENT_SECRET}`,
  });

  const { data: roles } = await auth0.roles.getAll();
  const allUsersInRoles = roles.map(async (role) => {
    const usersInRole = await auth0.roles.getUsers({
      id: role.id || '',
    });
    return { role: role.name, users: usersInRole.data };
  });

  // const userRoles = await Promise.all(allUsersInRoles);
  // const userList = await auth0.users.getAll();

  return { userList, userRoles };
}

async function UserAdmin(): Promise<JSX.Element> {
  const { userList, userRoles } = await getData();

  // console.log('userList: ', userList);
  // console.log('userRoles: ', userRoles);

  return (
    <div className="text-center">
      <h1 className="text-center">Administrer brukere</h1>

      <ul>
        {userRoles.map((role) => (
          <li>{JSON.stringify(role)}</li>
        ))}
      </ul>
    </div>
  );
}

const UserAdminPage = withPageAuthRequired(UserAdmin);
export default UserAdminPage;
