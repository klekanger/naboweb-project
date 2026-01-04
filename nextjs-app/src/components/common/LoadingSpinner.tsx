import { Spinner } from "@heroui/react";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  // Map spinner sizes to container sizes
  const containerSizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <div
        className={`${containerSizes[size]} flex items-center justify-center`}
      >
        <Spinner size={size} className="w-full h-full" />
      </div>
    </div>
  );
}
