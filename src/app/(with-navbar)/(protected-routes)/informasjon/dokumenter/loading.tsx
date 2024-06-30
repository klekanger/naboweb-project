import { Spinner } from "@nextui-org/react";

export default function Loading() {
  return (
    <div className="mx-auto mt-32 text-center">
      <Spinner size="lg" />
    </div>
  );
}
