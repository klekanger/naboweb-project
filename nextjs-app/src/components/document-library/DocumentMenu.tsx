"use client";

import CustomButton from "../CustomButton";
import { type DocumentMenuQueryResult } from "@/types/sanity.types";

export default function DocumentMenu({
  content,
}: {
  content: DocumentMenuQueryResult;
}) {
  const {
    button1Text,
    button2Text,
    button3Text,
    button4Text,
    file1,
    file2,
    file3,
    file4,
  } = content ?? {};

  if (!file1 || !file2 || !file3 || !file4) return null;
  if (!button1Text || !button2Text || !button3Text || !button4Text) return null;

  return (
    <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
      <CustomButton
        href={file1.url ?? "/"}
        buttonText={button1Text}
        className="w-full"
      />
      <CustomButton
        href={file2.url ?? "/"}
        buttonText={button2Text}
        className="w-full"
      />
      <CustomButton
        href={file3.url ?? "/"}
        buttonText={button3Text}
        className="w-full"
      />
      <CustomButton
        href={file4.url ?? "/"}
        buttonText={button4Text}
        className="w-full"
      />
      <CustomButton
        href="/information/referater"
        buttonText="Referater"
        className="w-full"
      />
      <CustomButton
        href="/information/dokumenter"
        buttonText="Andre dokumenter"
        className="w-full"
      />
    </div>
  );
}
