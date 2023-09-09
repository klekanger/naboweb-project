import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="container flex flex-col items-center text-center">
      <h1 className="mx-1 text-xl md:w-1/2">
        Du må logge inn for å se denne siden
      </h1>

      <SignIn signUpUrl="/sign-up" />
    </div>
  );
}
