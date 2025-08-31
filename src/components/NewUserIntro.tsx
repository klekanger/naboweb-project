"use client";

import { CustomPortableText } from "@/lib/CustomPortableText";
import { NewUserIntroQueryResult } from "@/types/sanity.types";
import { Card, CardHeader, Image } from "@heroui/react";
import { motion } from "motion/react";

export default function NewUserIntro({
  content,
}: {
  content?: NewUserIntroQueryResult;
}) {
  const { title, introText } = content || {};

  if (!introText) return null;

  return (
    <motion.section
      className="py-8 sm:py-16 max-w-7xl m-auto"
      initial={{ opacity: 0, y: 75 }}
      transition={{ duration: 1, ease: "easeOut" }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className="bg-brand-secondary">
        <CardHeader className="absolute top-0 left-0 w-full h-full pb-8 z-10">
          <div className="flex flex-col items-center justify-center m-auto px-2 md:px-0">
            <h2 className="prose text-3xl py-4 font-semibold text-brand-white text-center">
              {title}
            </h2>
            <CustomPortableText
              value={introText.body}
              paragraphClasses="text-brand-white max-w-2xl m-auto text-center md:text-left"
            />
          </div>
        </CardHeader>
        <Image
          removeWrapper
          className="z-0 w-full object-cover h-96 md:h-full"
          src="blob.svg"
        />
      </Card>
    </motion.section>
  );
}
