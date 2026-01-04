import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { connection } from "next/server";
import LoadingSpinner from "@/components/common/LoadingSpinner";

async function SignInContent() {
  // Defer to request time since SignIn renders in browser
  await connection();

  return <SignIn signUpUrl="/sign-up" />;
}

export default function Page() {
  return (
    <div className="container flex flex-col items-center justify-center h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <SignInContent />
      </Suspense>
    </div>
  );
}
