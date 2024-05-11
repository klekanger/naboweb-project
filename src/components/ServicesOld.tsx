"use client";

import { Button, Card, CardBody, Link } from "@nextui-org/react";
import { motion } from "framer-motion";
import Image from "next/image";

const IMG_WIDTH = 600;
const IMG_HEIGHT = 600;

const StyledCard = ({
  title,
  description,
  src,
  alt,
  buttonHref,
  buttonText,
}: {
  title: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  description: any;
  src: string;
  alt: string;
  buttonHref: string;
  buttonText: string;
}) => (
  <Card
    classNames={{
      base: "h-full border-brand-secondary/20 border hover:scale-105 duration-250",
    }}
  >
    <CardBody className="p-0 grid grid-cols-12 gap-4 bg-white ">
      <div className="col-span-6 lg:col-span-6 overflow-hidden">
        {src && (
          <Image
            className="h-full w-full 	"
            src={src}
            width={IMG_WIDTH}
            height={IMG_HEIGHT}
            style={{ objectFit: "cover" }}
            sizes="16vw"
            alt={alt}
          />
        )}
      </div>
      <span className="col-span-6 lg:col-span-6 h-full py-4 pr-4 flex flex-col justify-between">
        <div className="pb-6">
          <h3 className="text-xl font-bold pt-0 mt-0">{title}</h3>
          <p>tekst...</p>
        </div>
        <Button
          as={Link}
          size="sm"
          variant="bordered"
          color="default"
          className="rounded-full border-1 w-24 hover:border-brand-accent text-xs"
          href={`/${buttonHref}`}
        >
          {buttonText}
        </Button>
      </span>
    </CardBody>
  </Card>
);

export default function Services({ content }) {
  if (!content) {
    console.error("Missing content from CMS");
    return null;
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, transform: "translateY(50px)" }}
        whileInView={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
        className="py-16 max-w-6xl m-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.map((box) => {
            const imageUrl = "/gartnerihagen_solnedgang.jpg";

            const { title, description, image } = box.fields;

            console.log("bilde ", image);

            return (
              <div>
                <StyledCard
                  key={box._key}
                  title={title || "Tittel mangler"}
                  description={description}
                  src={`https://${image?.fields?.file?.url || imageUrl}`}
                  alt={description ?? ""}
                  buttonHref={box?.moduleLink?.slug?.current || "#"}
                  buttonText="Les mer"
                />
              </div>
            );
          })}
        </div>
      </motion.section>
    </>
  );
}
