import Image from 'next/image';
import heroImage from 'public/gartnerihagen-fellesomrade-3200x1800.webp';

export default function HeroWide({ pageTitle, excerpt, pageImage }) {
  console.log('pageTitle: ', pageTitle);
  console.log('excerpt: ', excerpt);
  console.log('pageImage: ', pageImage);

  return (
    <div className="-mt-12 w-screen max-w-full overflow-hidden">
      <div className="img-zoom ">
        <Image
          src={heroImage}
          alt={pageTitle}
          priority={true}
          className="h-screen w-screen object-cover object-center"
        />
      </div>
      <div className="absolute left-24 top-1/3 w-3/4 break-words rounded-md bg-neutral-950/50 px-5 text-gray-900 lg:w-2/5">
        <h1 className="p-8 text-[3.75rem] font-semibold text-slate-50">
          Velkommen til Gartnerihagen
          <p className="mb-5 mt-3 text-[1.13rem]">
            Boligsameiet Gartnerihagen er - i all beskjedenhet - Askims
            hyggeligste nabolag. Sameiet består av 21 enheter og har adresse
            Gartner Moens vei i Askim.
          </p>
          <a
            href="https://gartnerihagen-askim.no/om-boligsameiet-gartnerihagen/"
            className="cursor-pointer"
          >
            <button className="mb-4 inline-flex h-14 w-28 items-center justify-center rounded-lg bg-emerald-400 py-7 text-center align-middle text-[1.25rem] text-slate-950">
              Les mer
            </button>
          </a>
        </h1>
      </div>
    </div>
  );
}
