export default function Footer() {
  return (
    <footer className="mt-auto flex h-64 w-full flex-col items-center justify-center bg-neutral-950">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p className="text-center text-2xl font-bold text-slate-50">
          Boligsameiet Gartnerihagen
        </p>
        <p className="text-center text-xl font-light text-slate-50">
          Askims hyggeligste nabolag
        </p>
      </div>
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p className="text-center text-xl font-light text-slate-50">
          <a
            href="https://www.facebook.com/groups/askimgartnerihagen"
            target="_blank"
            rel="noreferrer"
            className="transition duration-300 hover:text-green-200"
          >
            Facebook
          </a>
        </p>
      </div>
    </footer>
  );
}
