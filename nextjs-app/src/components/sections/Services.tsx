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
import { Button, Card, Tooltip } from "@heroui/react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type FunctionComponent, useCallback } from "react";
import { stegaClean } from "@sanity/client/stega";

type IconMapType = {
  [key: string]: FunctionComponent<IconProps>;
};

type ServicesCardProps = {
  title: string;
  description: string;
  icon: string;
  locked: boolean;
  url?: string;
  onNavigate: (url: string | undefined) => void;
};

function LockedServiceHint() {
  return (
    <Tooltip delay={1000}>
      <Button
        isIconOnly
        variant="ghost"
        aria-label="Krever innlogging"
        className="min-w-0 h-auto w-auto p-0 pl-[0.5em] text-base bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        🔐
      </Button>
      <Tooltip.Content>Krever innlogging</Tooltip.Content>
    </Tooltip>
  );
}

function ServicesCard({
  title,
  description,
  icon,
  locked,
  url,
  onNavigate,
}: ServicesCardProps) {
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
      onClick={() => onNavigate(url)}
      className="w-full p-4 hover:-translate-y-2 h-full cursor-pointer transition-transform shadow-lg border border-gray-200"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate(url);
        }
      }}
    >
      <div className="flex-row items-center gap-3 md:flex-col md:items-start! p-4">
        <div className="flex items-center shrink-0">
          {RenderedIcon && <RenderedIcon width={3} height={3} />}

          <h2 className="text-xl font-semibold pl-4 md:pl-0 md:pt-4">
            <span className="inline-flex items-center">
              {title.toUpperCase()}
              {locked ? <LockedServiceHint /> : null}
            </span>
          </h2>
        </div>

        <div className="py-2 md:py-4 prose w-full">
          <p>{description}</p>
        </div>
      </div>
    </Card>
  );
}

export default function Services({
  content,
}: {
  content: FrontpageServicesQueryResult;
}) {
  const router = useRouter();

  const handlePress = useCallback((url: string | undefined) => {
    router.push(url || "/");
  }, [router]);

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

  return (
    <>
      <section className="py-8 sm:py-16 max-w-7xl m-auto gap-8 grid grid-cols-12 grid-rows-1">
        <motion.div
          className="col-span-12 md:col-span-4 h-full"
          initial={{ opacity: 0, y: 75 }}
          transition={{ duration: 1, ease: "easeOut" }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <ServicesCard
            title={title1 ?? ""}
            description={description1 ?? ""}
            locked={private1 ?? false}
            url={url1 ?? "/"}
            icon={icon1 ?? ""}
            onNavigate={handlePress}
          />
        </motion.div>
        <motion.div
          className="col-span-12 md:col-span-4 h-full"
          initial={{ opacity: 0, y: 75 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <ServicesCard
            title={title2 ?? ""}
            description={description2 ?? ""}
            locked={private2 ?? false}
            url={url2 ?? "/"}
            icon={icon2 ?? ""}
            onNavigate={handlePress}
          />
        </motion.div>
        <motion.div
          className="col-span-12 md:col-span-4 h-full"
          initial={{ opacity: 0, y: 75 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <ServicesCard
            title={title3 ?? ""}
            description={description3 ?? ""}
            locked={private3 ?? false}
            url={url3 ?? "/"}
            icon={icon3 ?? ""}
            onNavigate={handlePress}
          />
        </motion.div>
      </section>
    </>
  );
}
