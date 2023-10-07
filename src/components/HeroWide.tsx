import CustomButton from '@/components/CustomButton';
import type { HeroWideProps } from '@/types/types';
import { Button } from '@nextui-org/react';
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

  const { url } = pageImage?.fields?.file ?? {};
  if (!url) {
    console.error(`Missing featured image for hero section`);
    return null;
  }

  return (
    <section className="-mt-52 w-screen max-w-full overflow-hidden">
      <div className="img-zoom ">
        <Image
          src={`https:${url}`}
          width={width}
          height={height}
          sizes="100vw"
          alt={pageTitle}
          priority={true}
          className="h-screen w-screen object-cover object-center"
        />
      </div>
      <article
        className="
          absolute
          top-44
          mx-2 
          w-full 
          max-w-fit
          break-words 
          rounded-md
          bg-black/60
          px-2
          py-8 
          text-center 
          text-brand-white
          dark:bg-black/80 
          dark:text-brand-white 
          md:top-1/3 
          md:mx-32 
          md:w-8/12 
          md:px-10 
          lg:w-7/12
          xl:w-6/12
          2xl:w-4/12
          "
      >
        <h1 className="text-3xl lg:text-4xl xl:text-5xl">{pageTitle} </h1>
        <p className="mb-5 text-sm  md:text-base xl:text-lg">{excerpt}</p>

        <CustomButton
          href="/om-boligsameiet-gartnerihagen"
          buttonText="Les mer"
        />
      </article>
    </section>
  );
}
