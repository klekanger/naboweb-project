"use client";

// Icons from https://www.svgrepo.com/collection/small-flat-vectors/

import { BookIcon, HouseIcon, NewsIcon, PencilIcon } from "@/components/icons";
import type { IconProps, ServicesContent } from "@/types/types";
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

export default function Services({ content }: { content: ServicesContent[] }) {
  const router = useRouter();

  if (!content) {
    console.error("Missing content from CMS");
    return null;
  }

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

  return (
    <>
      <section className="py-8 sm:py-16 max-w-8xl m-auto">
        <div className="gap-8 grid grid-cols-12 grid-rows-1">
          {content.map((box) => {
            const { title, description, icon: iconName } = box.fields;
            const IconComponent = iconMap[iconName];

            return (
              <StyledCard
                key={box.sys.id}
                title={title || "Tittel mangler"}
                description={description}
                locked={box.fields.locked}
                url={box.fields.url}
                icon={<IconComponent width={3} height={3} />}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}
