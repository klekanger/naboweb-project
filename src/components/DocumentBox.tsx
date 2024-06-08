"use client";

import type { DocumentBoxProps } from "@/types/types";
import CustomButton from "./CustomButton";

export default function DocumentBox({ documentBoxLinks }: DocumentBoxProps) {
  const {
    menu1Name,
    menu2Name,
    menu3Name,
    menu4Name,
    menu5Name,
    menu6Name,
    menu1File,
    menu2File,
    menu3File,
    menu4File,
  } = documentBoxLinks;

  return (
    <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
      <CustomButton href={menu1File.url} buttonText={menu1Name} />
      <CustomButton href={menu2File.url} buttonText={menu2Name} />
      <CustomButton href={menu3File.url} buttonText={menu3Name} />
      <CustomButton href={menu4File.url} buttonText={menu4Name} />
      <CustomButton href="/informasjon/referater" buttonText={menu5Name} />
      <CustomButton href="/informasjon/dokumenter" buttonText={menu6Name} />
    </div>
  );
}
