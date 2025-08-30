"use client";

import { CustomPortableText } from "@/lib/CustomPortableText";
import { NewUserIntroQueryResult } from "@/types/sanity.types";
import { Card, CardBody, CardHeader } from "@heroui/react";
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
        <CardHeader>
          <h2 className="prose text-3xl py-4 font-semibold m-auto text-brand-white">
            {title}
          </h2>
        </CardHeader>
        <CardBody className="pb-8 md:pb-16">
          <CustomPortableText
            value={introText.body}
            paragraphClasses="text-brand-white max-w-2xl m-auto"
          />
        </CardBody>
      </Card>
    </motion.section>
  );
}
