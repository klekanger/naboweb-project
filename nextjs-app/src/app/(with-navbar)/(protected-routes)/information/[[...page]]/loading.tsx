"use client";

import { Spinner } from "@heroui/react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-[33vh]">
      <Spinner size="lg" />
    </div>
  );
}
