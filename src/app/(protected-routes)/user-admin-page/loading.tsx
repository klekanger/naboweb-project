import { Spinner } from "@nextui-org/spinner";

export default function Loading() {
  return (
    <>
      <h1 className="mb-8 text-center">Administrer brukere</h1>
      <div className="flex justify-center">
        <Spinner label="Laster..." size="lg" />
      </div>
    </>
  );
}
