"use client";

import CustomButton from "@/components/CustomButton";
import type { HeroWideProps } from "@/types/types";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Hero({ pageTitle, excerpt, pageImage }: HeroWideProps) {
  const { width, height } = pageImage?.fields?.file?.details?.image as {
    width: number;
    height: number;
    alt: string;
  };

  const { description = "" } = pageImage?.fields ?? {};

  const { url } = pageImage?.fields?.file ?? {};
  if (!url) {
    console.error("Missing featured image for hero section");
    return null;
  }

  return (
    <section className="grid grid-rows-[auto,1fr] grid-cols-1 sm:grid-rows-1 sm:grid-cols-12 sm:grid-flow-col gap-y-8 sm:gap-8 px-0 py-8 sm:py-16 max-w-8xl m-auto ">
      <div className="row-span-1 col-span-12 sm:col-span-6 lg:col-span-5 prose">
        <motion.h1
          style={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-3xl lg:text-4xl xl:text-5xl m-0 pb-4 sm:pb-8"
        >
          {pageTitle}{" "}
        </motion.h1>
        <motion.div
          style={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        >
          <p className="mt-0 text-sm md:text-base xl:text-lg">{excerpt}</p>

          <CustomButton
            className="justify-self-start mb-4 no-underline mt-4 sm:mt-8"
            href="/om-boligsameiet-gartnerihagen"
            buttonText="Les mer"
          />
        </motion.div>
      </div>
      <motion.div
        style={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
        className="sm:row-span-2 row-span-1 col-span-12 sm:col-span-6 lg:col-span-7 rounded-3xl overflow-hidden w-full h-full aspect-[4/3] sm:aspect-[16/10]"
      >
        <Image
          src={`https:${url}`}
          alt={description}
          width={3648}
          height={5472}
          sizes="(min-width: 640px) 50vw, 100vw"
          priority
          style={{ objectFit: "cover" }}
          className="h-full w-full"
        />
      </motion.div>
    </section>
  );
}
