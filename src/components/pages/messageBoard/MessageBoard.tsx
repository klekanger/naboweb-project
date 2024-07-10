"use client";

import { urlForImage } from "@/sanity/lib/utils";
import { MESSAGEBOARD_QUERYResult } from "@/types/sanity.types";
import { PlusCircleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { Button, Checkbox } from "@nextui-org/react";
import { type Image as SanityImage } from "sanity";
import MessageCard from "./MessageCard";
import { useState } from "react";

export default function MessageBoard({
  messages,
}: {
  messages: MESSAGEBOARD_QUERYResult;
}) {
  if (!messages) return null;
  const [showOnlyFromAdmin, setShowOnlyFromAdmin] = useState(false);

  return (
    <>
      <h1 className="lg:prose-xl font-thin mb-8 md:mb-16">OPPSLAGSTAVLE</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-4 md:mb-8 md:justify-between">
        <div className="flex gap-4">
          <Button
            color="primary"
            startContent={<PlusCircleIcon className="h-6 w-6" />}
          >
            Opprett innlegg
          </Button>

          <Button
            color="primary"
            startContent={<UserCircleIcon className="h-6 w-6" />}
          >
            Se mine innlegg
          </Button>
        </div>
        <Checkbox
          isSelected={showOnlyFromAdmin}
          onValueChange={setShowOnlyFromAdmin}
        >
          Kun innlegg fra styret
        </Checkbox>
      </div>
      <section className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {messages
          ?.filter((message) => (showOnlyFromAdmin ? message.fromAdmin : true))
          .map((message) => {
            const imageUrl = urlForImage(message?.messageImage as SanityImage)
              ?.width(800)
              .height(450)
              .fit("crop")
              .url();

            const author = message.fromAdmin
              ? { firstName: "Styret", lastName: "" }
              : message.author;

            return (
              <MessageCard
                key={message._id}
                title={message.title ?? ""}
                description={message?.bodyText as any}
                commentCount={message?.comments?.length ?? 0}
                url="/"
                imageUrl={imageUrl ?? null}
                author={author as any}
                fromAdmin={message?.fromAdmin ?? false}
                createdAt={message._createdAt}
              />
            );
          })}
      </section>
    </>
  );
}
