"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@heroui/react";

interface PaginationProps {
  total: number;
  page: number;
  onChange: (page: number) => void;
  showControls?: boolean;
  color?: "primary" | "secondary" | "default";
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  isDisabled?: boolean;
  isCompact?: boolean;
  showShadow?: boolean;
  classNames?: {
    base?: string;
    item?: string;
    cursor?: string;
  };
}

export default function Pagination({
  total,
  page,
  onChange,
  showControls = true,
  size = "md",
  radius = "md",
  isDisabled = false,
  isCompact = false,
  classNames = {},
}: PaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = isCompact ? 3 : 5;

    if (total <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(total - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < total - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Size classes for square buttons
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10",
    lg: "h-12 w-12 text-lg",
  };

  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={`flex justify-center items-center gap-2 ${classNames.base || ""}`}
    >
      {showControls && (
        <Button
          isIconOnly
          variant="ghost"
          size={size}
          isDisabled={isDisabled || page === 1}
          onPress={() => onChange(page - 1)}
          className={`bg-transparent text-gray-700 hover:bg-default/10 ${sizeClasses[size]} ${radiusClasses[radius]} p-0`}
          aria-label="Previous page"
        >
          <ChevronLeft
            className={`${size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"}`}
          />
        </Button>
      )}

      {pageNumbers.map((pageNum, index) => {
        if (pageNum === "...") {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
              ...
            </span>
          );
        }

        const pageNumber = pageNum as number;
        const isActive = pageNumber === page;

        return (
          <Button
            key={pageNumber}
            variant="ghost"
            size={size}
            isDisabled={isDisabled}
            onPress={() => onChange(pageNumber)}
            className={`${sizeClasses[size]} ${radiusClasses[radius]} p-0 ${
              isActive
                ? "bg-brand-secondary! text-white! border-brand-primary"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            aria-label={`Page ${pageNumber}`}
            aria-current={isActive ? "page" : undefined}
          >
            {pageNumber}
          </Button>
        );
      })}

      {showControls && (
        <Button
          isIconOnly
          variant="ghost"
          size={size}
          isDisabled={isDisabled || page === total}
          onPress={() => onChange(page + 1)}
          className={`bg-transparent text-gray-700 hover:bg-default/10 ${sizeClasses[size]} ${radiusClasses[radius]} p-0`}
          aria-label="Next page"
        >
          <ChevronRight
            className={`${size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"}`}
          />
        </Button>
      )}
    </div>
  );
}
