import type { HeroWideProps } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroWide({
  pageTitle,
  excerpt,
  pageImage,
}: HeroWideProps) {
  const { width, height } = pageImage?.fields?.file?.details?.image as {
    width: number;
    height: number;
  };

  return (
    <div className="-mt-32 w-screen max-w-full overflow-hidden">
      <div className="img-zoom ">
        <Image
          src={`https:${pageImage?.fields?.file?.url ?? ''}`}
          width={width}
          height={height}
          sizes="100vw"
          alt={pageTitle}
          priority={true}
          className="h-screen w-screen object-cover object-center"
        />
      </div>
      <div className="absolute left-24 top-1/3 w-3/4 break-words rounded-md bg-neutral-950/60 px-5 text-gray-900 lg:w-2/5">
        <h1 className="p-8 text-slate-50">
          {pageTitle}
          <p className="mb-5 mt-3 font-normal">{excerpt}</p>
          <Link
            href="/om-boligsameiet-gartnerihagen"
            className="cursor-pointer"
          >
            <button className="mb-4 inline-flex h-14 w-28 items-center justify-center rounded-lg bg-emerald-400 py-7 text-center align-middle text-[1.25rem] text-slate-950">
              Les mer
            </button>
          </Link>
        </h1>
      </div>
    </div>
  );
}
