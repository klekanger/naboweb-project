import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { connection } from "next/server";

async function SignUpContent() {
  // Defer to request time since SignUp renders in browser
  await connection();

  return <SignUp />;
}

export default function Page() {
  return (
    <div className="container flex flex-col items-center text-center">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        }
      >
        <SignUpContent />
      </Suspense>
    </div>
  );
}
