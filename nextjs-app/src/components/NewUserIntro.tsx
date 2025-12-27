"use client";

import { CustomPortableText } from "@/lib/CustomPortableText";
import { NewUserIntroQueryResult } from "@/types/sanity.types";
import { Card } from "@heroui/react";
import { motion } from "motion/react";
import Image from "next/image";

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
      <Card className="relative min-h-[300px] overflow-hidden">
        {/* Background image */}
        <Image
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          src="/blob.svg"
          width={1200}
          height={600}
          priority
        />
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center m-auto px-2 md:px-0 py-8 md:py-16">
          <Card.Header className="text-center">
            <Card.Title className="prose text-3xl py-4 font-semibold text-brand-white text-center">
              {title}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <CustomPortableText
              value={introText.body}
              paragraphClasses="text-brand-white max-w-2xl m-auto text-center md:text-left"
            />
          </Card.Content>
        </div>
      </Card>
    </motion.section>
  );
}
