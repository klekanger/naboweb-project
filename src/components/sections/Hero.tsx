"use client";

import CustomButton from "@/components/CustomButton";
import { urlForImage } from "@/sanity/lib/utils";
import type { HeroProps } from "@/types/types";
import { motion } from "motion/react";
import { HeartOffIcon } from "lucide-react";
import Image from "next/image";
import type { Image as SanityImage } from "sanity";

export default function Hero({ content }: { content: HeroProps }) {
  if (!content || !content?.data) {
    console.error("Missing heroText from sanity");
    return null;
  }

  const { title, showButton, buttonText, bodyText, buttonLink } =
    content.data ?? {};

  const imageUrl = urlForImage(content.data?.heroImage as SanityImage);
  const { alt, lqip } = content.data.heroImage ?? {};

  return (
    <section className="grid grid-rows-[auto,1fr] grid-cols-1 sm:grid-rows-1 sm:grid-cols-12 sm:grid-flow-col gap-y-8 sm:gap-8 px-0 py-8 sm:py-16 max-w-7xl m-auto ">
      <div className="row-span-1 col-span-12 sm:col-span-6 lg:col-span-5 prose lg:prose-lg 2xl:prose-xl">
        <motion.h1
          style={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {title}
        </motion.h1>
        <motion.div
          style={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        >
          <p>{bodyText}</p>

          {showButton && (
            <CustomButton
              className="justify-self-start mb-4 no-underline mt-4 sm:mt-8"
              href={buttonLink?.slug?.current ?? "/"}
              buttonText={buttonText ?? "Les mer!"}
            />
          )}
        </motion.div>
      </div>
      <motion.div
        style={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
        className="sm:row-span-2 row-span-1 col-span-12 sm:col-span-6 lg:col-span-7 rounded-xl overflow-hidden w-full h-full aspect-[4/3] sm:aspect-[16/10]"
      >
        {imageUrl && (
          <Image
            src={imageUrl.url()}
            alt={alt ?? ""}
            width={3648}
            height={5472}
            sizes="(min-width: 640px) 50vw, 100vw"
            priority
            placeholder="blur"
            blurDataURL={lqip ?? ""}
            style={{ objectFit: "cover" }}
            className="h-full w-full"
          />
        )}
      </motion.div>
    </section>
  );
}
