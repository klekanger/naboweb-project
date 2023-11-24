"use client";

import type { DocumentBoxProps } from "@/types/types";
import { Button } from "@nextui-org/react";
import Link from "next/link";

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
      <Button as={Link} href={menu1File.url} size="lg">
        {menu1Name}
      </Button>
      <Button as={Link} href={menu2File.url} size="lg">
        {menu2Name}
      </Button>{" "}
      <Button as={Link} href={menu3File.url} size="lg">
        {menu3Name}
      </Button>{" "}
      <Button as={Link} href={menu4File.url} size="lg">
        {menu4Name}
      </Button>{" "}
      <Button as={Link} href="/informasjon/referater" size="lg">
        {menu5Name}
      </Button>{" "}
      <Button as={Link} href="/informasjon/dokumenter" size="lg">
        {menu6Name}
      </Button>
    </div>
  );
}
