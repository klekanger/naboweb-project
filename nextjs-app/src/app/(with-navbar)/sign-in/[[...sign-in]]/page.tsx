import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="container flex flex-col items-center justify-center h-screen">
      <SignIn signUpUrl="/sign-up" />
    </div>
  );
}
