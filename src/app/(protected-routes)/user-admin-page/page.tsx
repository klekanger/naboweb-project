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

export default function UserAdmin() {
  return (
    <div className="text-center">
      <h1 className="text-center">Administrer brukere</h1>
    </div>
  );
}
