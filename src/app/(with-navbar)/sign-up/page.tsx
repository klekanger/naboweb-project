import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="container flex flex-col items-center text-center">
      <SignUp />
    </div>
  );
}
