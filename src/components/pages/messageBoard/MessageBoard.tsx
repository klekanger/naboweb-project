"use client";

import InfoBox from "@/components/InfoBox";
import { urlForImage } from "@/sanity/lib/utils";
import { MESSAGEBOARD_QUERYResult } from "@/types/sanity.types";
import { useUser } from "@clerk/nextjs";
import { Button, Checkbox } from "@nextui-org/react";
import { CirclePlus, CircleUser, MessagesSquare } from "lucide-react";
import { useState } from "react";
import { type Image as SanityImage } from "sanity";
import MessageCard from "./MessageCard";
import Link from "next/link";

export default function MessageBoard({
  messages,
}: {
  messages: MESSAGEBOARD_QUERYResult;
}) {
  if (!messages) return null;
  const [showOnlyFromAdmin, setShowOnlyFromAdmin] = useState(false);
  const { user, isLoaded } = useUser();

  const { firstName, lastName, publicMetadata } = user ?? {};
  const isAdmin = Array.isArray(publicMetadata?.roles)
    ? publicMetadata.roles.includes("admin")
    : false;

  const footerMessage =
    isLoaded &&
    `${isAdmin ? `Du publiserer som: ${firstName} ${lastName} eller styret` : ""}`;

  return (
    <>
      <InfoBox
        title="Oppslagstavle"
        message="Her kan du legge ut meldinger til andre i sameiet, og se meldinger fra styret. "
        footerMessage={footerMessage ? footerMessage : null}
        icon={<MessagesSquare />}
        className="mb-16"
      />

      <div className="flex flex-col md:flex-row gap-4 mb-4 md:mb-8 md:justify-between">
        <div className="flex gap-4">
          <Button
            as={Link}
            href="/messageboard/new-message"
            color="primary"
            startContent={<CirclePlus />}
          >
            Opprett innlegg
          </Button>

          <Button color="primary" startContent={<CircleUser />}>
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
                comments={message?.comments ?? []}
              />
            );
          })}
      </section>
    </>
  );
}
