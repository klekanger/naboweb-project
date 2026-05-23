import AlertUser from "@/components/AlertUser";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  documents: unknown[] | null | undefined;
  headingClassName?: string;
  children: ReactNode;
};

export default function DocumentCollectionPage({
  title,
  documents,
  headingClassName = "text-center text-2xl md:text-left md:text-4xl prose mb-8",
  children,
}: Props) {
  if (!documents) {
    return (
      <section className="flex flex-col justify-center align-middle">
        <AlertUser
          alertTitle="Ingen dokumenter"
          alertMessage="Det ser ikke ut til at det eksisterer noen dokumenter på denne siden. "
        />
        <p className="pl-4 pt-4">
          <Link href="/information">Gå tilbake »</Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className={headingClassName}>{title}</h1>
      {children}
    </section>
  );
}
