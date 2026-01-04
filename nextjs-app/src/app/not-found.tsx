"use client";

import CustomButton from "@/components/CustomButton";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center h-screen pb-32 justify-between">
      <div className="flex-1" />
      <section className="text-center pb-8">
        <h2 className="text-6xl md:text-8xl text-brand-secondary2 pb-0">404</h2>
        <h3 className="pt-0 pb-16 ">Her var det tomt!</h3>

        <CustomButton
          size="lg"
          variant="primary"
          className="rounded-full border-2 w-24 text-xs hover:no-underline!"
          href="/"
        >
          Til forsiden
        </CustomButton>
      </section>
      <p className="text-xs ">
        Lekanger tekst og kode &#169; {new Date().getFullYear()}
      </p>
    </div>
  );
}
