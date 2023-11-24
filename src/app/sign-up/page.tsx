"use client";

import { useSignUp } from "@clerk/clerk-react";
import { SignUp } from "@clerk/nextjs";
import { Spinner } from "@nextui-org/react";
import { useEffect } from "react";

export default function SignMeUp() {
  const { signUp, isLoaded } = useSignUp();

  if (!isLoaded || !signUp) {
    return (
      <div className="container flex justify-center">
        Not loaded
        <Spinner />
      </div>
    );
  }

  // Get the token from the query parameter
  const param = "__clerk_ticket";
  let ticket = "";

  if (typeof window !== "undefined") {
    ticket = new URL(window.location.href).searchParams.get(param) ?? "";
  }

  useEffect(() => {
    void signUpUser();
  }, []);

  async function signUpUser() {
    try {
      /* const response = await signUp.create({
        ticket,
        strategy: 'ticket',
        
      }); */
    } catch (error) {
      console.error("noe gikk galt:", error);
    }
  }

  return (
    <div className="container flex flex-col items-center text-center">
      <SignUp unsafeMetadata={{ roles: ["user"] }} />
    </div>
  );
}
