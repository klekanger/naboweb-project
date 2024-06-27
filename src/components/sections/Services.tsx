"use client";

// Icons from https://www.svgrepo.com/collection/small-flat-vectors/

import {
  BookIcon,
  HouseIcon,
  NewsIcon,
  PencilIcon,
  DocumentIcon,
} from "@/components/icons";
import type { IconProps, ServicesProps } from "@/types/types";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { type FunctionComponent } from "react";

type IconMapType = {
  [key: string]: FunctionComponent<IconProps>;
};

const iconMap: IconMapType = {
  HouseIcon,
  NewsIcon,
  PencilIcon,
  BookIcon,
};

export default function Services({ content }: { content: ServicesProps }) {
  const router = useRouter();

  if (!content || !content?.data) {
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
  } = content.data ?? {};

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
    icon: JSX.Element;
    locked: boolean;
    url?: string;
  }) => (
    <Card
      isPressable
      onPress={() => handlePress(url)}
      className="col-span-12 lg:col-span-4 p-4 hover:-translate-y-2 "
    >
      <CardHeader className="flex-col !items-start hover:">
        <div className=" flex items-center justify-center">{icon}</div>
      </CardHeader>

      <CardBody className="pt-0 prose">
        <h2 className="mt-4 text-xl font-semibold">
          {title.toUpperCase()}{" "}
          {locked && <span className="pl-[0.5em]">🔐</span>}
        </h2>
        <p>{description}</p>
      </CardBody>
    </Card>
  );

  const RenderedIcon1 = iconMap[icon1] || DocumentIcon;
  const RenderedIcon2 = iconMap[icon2] || DocumentIcon;
  const RenderedIcon3 = iconMap[icon3] || DocumentIcon;

  return (
    <>
      <section className="py-8 sm:py-16 max-w-8xl m-auto">
        <div className="gap-8 grid grid-cols-12 grid-rows-1">
          <StyledCard
            title={title1}
            description={description1}
            locked={private1}
            url={url1}
            icon={<RenderedIcon1 width={3} height={3} />}
          />
          <StyledCard
            title={title2}
            description={description2}
            locked={private2}
            url={url2}
            icon={<RenderedIcon2 width={3} height={3} />}
          />
          <StyledCard
            title={title3}
            description={description3}
            locked={private3}
            url={url3}
            icon={<RenderedIcon3 width={3} height={3} />}
          />
        </div>
      </section>
    </>
  );
}
