"use client";

// Icons from https://www.svgrepo.com/collection/small-flat-vectors/

import {
  BookIcon,
  DocumentIcon,
  HouseIcon,
  NewsIcon,
  PencilIcon,
} from "@/components/icons";
import { type FrontpageServicesQueryResult } from "@/types/sanity.types";
import type { IconProps } from "@/types/types";
import { Card, CardBody, CardHeader, Tooltip } from "@heroui/react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type FunctionComponent } from "react";
import { stegaClean } from "@sanity/client/stega";

type IconMapType = {
  [key: string]: FunctionComponent<IconProps>;
};

export default function Services({
  content,
}: {
  content: FrontpageServicesQueryResult;
}) {
  const router = useRouter();

  if (!content) {
    console.error("Missing heroText from sanity");
    return null;
  }

  const {
    description1,
    description2,
    description3,
    icon1,
    icon2,
    icon3,
    private1,
    private2,
    private3,
    title1,
    title2,
    title3,
    url1,
    url2,
    url3,
  } = content ?? {};

  function handlePress(url: string | undefined) {
    router.push(url || "/");
  }

  const StyledCard = ({
    title,
    description,
    icon,
    locked,
    url,
  }: {
    title: string;
    description: string;
    icon: string;
    locked: boolean;
    url?: string;
  }) => {
    const IconMap: IconMapType = {
      HouseIcon,
      BookIcon,
      DocumentIcon,
      NewsIcon,
      PencilIcon,
    };

    const cleanIcon = stegaClean(icon);
    const RenderedIcon = IconMap[cleanIcon as keyof IconMapType];

    return (
      <Card
        isPressable
        onPress={() => handlePress(url)}
        className="col-span-12 lg:col-span-4 p-4 hover:-translate-y-2 h-full"
      >
        <CardHeader className="flex-col !items-start hover:">
          <div className=" flex items-center justify-center">
            {RenderedIcon && <RenderedIcon width={3} height={3} />}
          </div>
        </CardHeader>

        <CardBody className="pt-0 prose">
          <h2 className="mt-4 text-xl font-semibold">
            {title.toUpperCase()}{" "}
            {locked && (
              <Tooltip content="Krever innlogging">
                <span className="pl-[0.5em]">🔐</span>
              </Tooltip>
            )}
          </h2>
          <p>{description}</p>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
      <section className="py-8 sm:py-16 max-w-7xl m-auto gap-8 grid grid-cols-12 grid-rows-1">
        <motion.div
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0, y: 75 }}
          transition={{ duration: 1, ease: "easeOut" }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <StyledCard
            title={title1 ?? ""}
            description={description1 ?? ""}
            locked={private1 ?? false}
            url={url1 ?? "/"}
            icon={icon1 ?? ""}
          />
        </motion.div>
        <motion.div
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0, y: 75 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <StyledCard
            title={title2 ?? ""}
            description={description2 ?? ""}
            locked={private2 ?? false}
            url={url2 ?? "/"}
            icon={icon2 ?? ""}
          />
        </motion.div>
        <motion.div
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0, y: 75 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <StyledCard
            title={title3 ?? ""}
            description={description3 ?? ""}
            locked={private3 ?? false}
            url={url3 ?? "/"}
            icon={icon3 ?? ""}
          />
        </motion.div>
      </section>
    </>
  );
}
