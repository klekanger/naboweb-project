import { clerkClient, SignUp } from '@clerk/nextjs';

export default async function SignUpUser() {
  const invitation = await clerkClient.invitations.createInvitation({
    emailAddress: 'kurt.lekanger@gmail.com',
    redirectUrl: 'localhost:3000/sign-up',
  });


  return (
    <div className="container flex flex-col items-center text-center">
      <h1>Ta kontakt med styret for å få en konto</h1>
      <SignUp />
    </div>
  );
}
