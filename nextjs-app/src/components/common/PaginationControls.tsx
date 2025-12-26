"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "./Pagination";

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
    <div className="my-8">
      <Pagination
        total={totalPages}
        page={currentPage + 1} // Convert to 1-based for display
        onChange={(page) => handlePageChange(page - 1)} // Convert back to 0-based
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
