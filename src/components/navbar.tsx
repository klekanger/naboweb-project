import Image from 'next/image';
import Link from 'next/link';
import gartnerihagenLogo from 'public/gartnerihagen.svg';

export default function Navbar() {
  return (
    <nav className="fixed flex w-full flex-wrap items-center justify-between break-words bg-neutral-950 px-8 py-3 text-gray-900">
      <Link href="/" className="cursor-pointer">
        <Image src={gartnerihagenLogo} alt="Gartnerihagen-logo" />
      </Link>
      <div>
        <div className="flex items-center justify-end">
          <p className="mr-8 text-xl font-light text-slate-50 transition duration-300 hover:text-green-200">
            <Link href="/informasjon" className="cursor-pointer">
              For beboere
            </Link>
          </p>
          <p className="mr-8 text-xl font-light text-slate-50 transition duration-300 hover:text-green-200">
            <Link href="/blog" className="cursor-pointer">
              Blogg
            </Link>
          </p>
          <p className="mr-8 text-xl font-light text-slate-50 transition duration-300 hover:text-green-200">
            <Link
              href="/om-boligsameiet-gartnerihagen"
              className="cursor-pointer"
            >
              Om oss
            </Link>
          </p>
          <p className="text-xl font-light text-slate-50 transition duration-300 hover:text-green-200">
            <Link href="/styret" className="cursor-pointer">
              Styret
            </Link>
          </p>
          <button className="ml-8 flex h-10 w-32 cursor-pointer items-center justify-center rounded-md bg-emerald-400 px-4 text-center align-middle font-semibold text-slate-950 transition duration-300 hover:bg-emerald-200">
            <span className="flex-grow">Logg inn</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
