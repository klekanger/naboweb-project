"use client";

import ContentEditor from "@/components/shared/ContentEditor";
import { compareClerkAndSanityUser } from "@/lib/compareClerkAndSanityUser";
import { currentUserRoles } from "@/lib/currentUserRoles";
import { CustomPortableText } from "@/lib/CustomPortableText";
import { formatDate } from "@/lib/format-date";
import { urlForImage } from "@/sanity/lib/utils";
import { MessagePageProps } from "@/types/types";
import { useUser } from "@clerk/nextjs";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Spacer,
} from "@nextui-org/react";
import { ArrowLeftIcon, CircleUser, MessageSquare, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import type { Image as SanityImage } from "sanity";

const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 600;

export default function MessagePage(props: MessagePageProps) {
  const { data } = props;
  const userData = useUser();
  const { isAdmin } = currentUserRoles(userData?.user as any);
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  const userIsMessageAuthor = compareClerkAndSanityUser({
    clerkUser: userData?.user?.id ?? "",
    sanityUser: data?.author?._id ?? "",
  });

  const {
    messageImage,
    tags,
    title,
    bodyText,
    _createdAt,
    _updatedAt,
    author,
    fromAdmin,
    comments = [],
  } = data ?? {};

  if (!data) {
    notFound();
  }

  const commentCount = comments?.length ?? 0;

  return (
    <>
      {!isEditingMessage ? (
        <>
          <Card className="p-2 py-8 mb-16">
            <CardHeader className="flex-col !items-start">
              <div className="font-thin text-base pb-2 flex text-brand-black/60">
                {fromAdmin ? (
                  <Shield className="h-auto pr-2" />
                ) : (
                  <CircleUser className="h-auto pr-2" />
                )}
                {fromAdmin ? "Styret" : ""}
                {`${author?.firstName ?? ""} ${author?.lastName ?? ""} | ${formatDate(_createdAt ?? "")} ${
                  _updatedAt !== _createdAt
                    ? `(oppdatert ${formatDate(_updatedAt ?? null)})`
                    : ""
                }`}
              </div>
            </CardHeader>

            <CardBody className="pt-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="prose lg:prose-xl pb-8">
                <h2 className="mt-4 text-lg font-semibold">{title}</h2>

                <CustomPortableText
                  value={bodyText}
                  paragraphClasses="prose lg:prose-xl"
                />
              </div>
              {messageImage && (
                <Image
                  src={
                    urlForImage(messageImage as SanityImage)
                      ?.width(IMAGE_WIDTH)
                      .height(IMAGE_HEIGHT)
                      .fit("max")
                      .dpr(2)
                      .url() ?? ""
                  }
                  alt={messageImage?.alt ?? ""}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  width={IMAGE_WIDTH}
                  height={IMAGE_HEIGHT}
                  style={{
                    objectFit: "cover",
                  }}
                  priority
                  className="rounded-large mb-0 pb-0"
                />
              )}
            </CardBody>
            <CardFooter>
              <div className="flex gap-4 flex-col md:flex-row">
                <Button
                  color="primary"
                  as={Link}
                  href="/messageboard"
                  startContent={<ArrowLeftIcon />}
                >
                  Tilbake
                </Button>

                {userIsMessageAuthor || isAdmin ? (
                  <>
                    <Button
                      color="primary"
                      className="w-32"
                      onClick={() => setIsEditingMessage(true)}
                    >
                      Rediger
                    </Button>
                    <Button color="danger" className="w-32">
                      Slett
                    </Button>
                  </>
                ) : null}
              </div>
            </CardFooter>
          </Card>
        </>
      ) : (
        <>
          <ContentEditor
            title="Rediger innhold"
            editorTitle={title ?? ""}
            editorContent={bodyText ?? []}
          />
        </>
      )}
      <Spacer y={8} />
      <Card className="lg:p-4">
        <CardHeader className="flex-col !items-start ">
          <h2 className="text-lg font-semibold flex">
            {" "}
            <MessageSquare className="h-auto mr-2" />
            Kommentarer ({commentCount})
          </h2>
        </CardHeader>

        <CardBody>
          <div className="prose lg:prose-xl pb-8">
            {comments &&
              comments.length > 0 &&
              comments.map((comment) => (
                <div key={comment._key}>
                  <h3 className="mt-4 font-semibold ">
                    {comment.commentTitle}
                  </h3>
                  <p>{comment.commentText}</p>
                  <div className="text-xs h-auto text-brand-black/60 italic">
                    &ndash; {comment.commentAuthor?.firstName}{" "}
                    {comment.commentAuthor?.lastName}
                    {comment?.published && (
                      <span className="not-italic">
                        {" "}
                        | {formatDate(comment?.published ?? "")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardBody>
      </Card>
    </>
  );
}

// TODO: Add more advanced comment functionality. Reply to comments, edit comments, delete comments, etc.
