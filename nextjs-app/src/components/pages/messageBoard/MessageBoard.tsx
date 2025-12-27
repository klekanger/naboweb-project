"use client";

import InfoBox from "@/components/InfoBox";
import CustomButton from "@/components/CustomButton";
import { urlForImage } from "@/sanity/lib/utils";
import { MessageboardQueryResult } from "@/types/sanity.types";
import { useUser } from "@clerk/nextjs";
import { Checkbox, Label } from "@heroui/react";
import { CircleUser, MessagesSquare, CirclePlus } from "lucide-react";
import { useState } from "react";
import MessageCard from "./MessageCard";

export default function MessageBoard({
  messages,
  messageCount,
}: {
  messages: MessageboardQueryResult;
  messageCount: number;
}) {
  if (!messages) return null;

  const [showOnlyFromAdmin, setShowOnlyFromAdmin] = useState(false);
  const [showOnlyMyMessages, setShowOnlyMyMessages] = useState(false);
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
          <CustomButton href="/messageboard/new-message">
            <CirclePlus className="mr-1 size-6" />
            Opprett innlegg
          </CustomButton>

          <CustomButton
            onPress={() => setShowOnlyMyMessages(!showOnlyMyMessages)}
          >
            <CircleUser className="mr-1 size-6" />
            {`Se ${showOnlyMyMessages ? "alle" : "mine"} innlegg`}
          </CustomButton>
        </div>

        <Checkbox
          id="show-only-admin"
          isSelected={showOnlyFromAdmin}
          onChange={setShowOnlyFromAdmin}
        >
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label htmlFor="show-only-admin">Kun innlegg fra styret</Label>
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div className="text-sm text-brand-black/60 pb-4">{`Totalt ${messageCount} innlegg`}</div>
      <section className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {messages.length > 0 ? (
          messages
            ?.filter(
              (message) =>
                (showOnlyFromAdmin ? message.fromAdmin : true) &&
                (showOnlyMyMessages ? user?.id === message.author?._id : true),
            )
            .map((message) => {
              const imageUrl = urlForImage(message?.messageImage as SanityImage)
                ?.width(800)
                .height(600)
                .url();

              const author = message.fromAdmin
                ? { firstName: "Styret", lastName: "" }
                : message.author;

              return (
                <MessageCard
                  key={message._id}
                  id={message._id}
                  title={message.title ?? ""}
                  description={message?.bodyText as any}
                  commentCount={message?.comments?.length ?? 0}
                  imageUrl={imageUrl ?? null}
                  author={author as any}
                  fromAdmin={message?.fromAdmin ?? false}
                  createdAt={message._createdAt}
                  comments={message?.comments ?? []}
                  userIsMessageAuthor={user?.id === message.author?._id}
                />
              );
            })
        ) : (
          <p className="text-brand-black font-light">
            Det er ingen innlegg ennå. Kanskje du vil opprette det første?
          </p>
        )}
      </section>
    </>
  );
}

// TODO: Add tag feature
