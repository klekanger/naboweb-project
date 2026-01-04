import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { connection } from "next/server";
import LoadingSpinner from "@/components/common/LoadingSpinner";

async function SignUpContent() {
  // Defer to request time since SignUp renders in browser
  await connection();

  return <SignUp />;
}

export default function Page() {
  return (
    <div className="container flex flex-col items-center text-center">
      <Suspense fallback={<LoadingSpinner />}>
        <SignUpContent />
      </Suspense>
    </div>
  );
}
