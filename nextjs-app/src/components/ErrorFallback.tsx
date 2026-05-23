"use client";

import { useEffect } from "react";

type Props = {
  error: Error;
  reset: () => void;
};

export function ErrorFallback({ error, reset }: Props) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("FEIL:", error);
  }, [error]);

  return (
    <div className="mx-auto mt-32 flex h-screen flex-col items-center text-center">
      <h2>Noe gikk galt!</h2>
      <p className="pt-4">
        Ta kontakt med webadministrator eller styret hvis problemet vedvarer.
      </p>
      <p className="pt-4 italic">
        (Nerdete feilmelding: &lsquo;{error.message}&rsquo;)
      </p>
      <button
        type="button"
        className="bg-primaryButton mt-8 rounded-xl border-2 border-black p-2"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => {
            reset();
          }
        }
      >
        Prøv igjen
      </button>
    </div>
  );
}
