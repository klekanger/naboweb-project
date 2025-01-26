"use client";

import { Pagination } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationControlsProps {
  totalPages: number;
  currentPage: number;
  baseUrl: string;
}

export default function PaginationControls({
  totalPages,
  currentPage,
  baseUrl,
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${baseUrl}?${params.toString()}`);
  };

  return (
    <div className="flex justify-center my-8">
      <Pagination
        total={totalPages}
        page={currentPage + 1} // NextUI uses 1-based indexing
        onChange={(page) => handlePageChange(page - 1)} // Convert back to 0-based indexing
        showControls
        color="primary"
        size="lg"
        radius="md"
        classNames={{
          base: "gap-2",
          item: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
          cursor: "bg-blue-600 text-white border-blue-600",
        }}
      />
    </div>
  );
}
