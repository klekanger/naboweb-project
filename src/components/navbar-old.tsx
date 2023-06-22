export default function Navbar() {
  return (
    <div className="flex h-24 w-full flex-col items-center justify-center bg-gray-800">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4">
        <div className="flex items-center">
          <a href="/" className="text-xl font-bold text-white">
            Gartnerihagen
          </a>
        </div>
        <div className="flex items-center">
          <a
            href="/"
            className="rounded px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Hjem
          </a>
          <a
            href="/styret"
            className="rounded px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Styret
          </a>
          <a
            href="/dokumenter"
            className="rounded px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Dokumenter
          </a>
          <a
            href="/kontakt"
            className="rounded px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Kontakt
          </a>
        </div>
      </div>
    </div>
  );
}
