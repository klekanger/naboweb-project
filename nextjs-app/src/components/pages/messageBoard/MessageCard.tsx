"use client";

import { formatDate } from "@/lib/format-date";
import { MessageCardProps } from "@/types/types";
import { Card, Tooltip } from "@heroui/react";
import { toPlainText } from "@portabletext/react";
import { CircleUser, MessagesSquare, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MessageCard({
  title,
  id,
  description,
  commentCount,
  imageUrl,
  author,
  fromAdmin,
  createdAt,
  comments,
  userIsMessageAuthor,
}: MessageCardProps) {
  const router = useRouter();
  const textLength = imageUrl ? 100 : 300;
  const plainText = toPlainText(description);
  const slicedText =
    plainText.length > textLength
      ? plainText.slice(0, textLength).concat("[...]")
      : plainText;

  const commentPreviews =
    comments?.slice(0, 3).map((comment) => {
      return {
        title: comment.commentTitle?.slice(0, 50),
        key: comment._key,
        author: comment?.commentAuthor?.firstName ?? "",
      };
    }) ?? [];

  return (
    <Card
      className={`p-2 ${imageUrl ? "row-span-2" : "row-span-1"} hover:scale-[102%] transition-transform cursor-pointer border border-gray-200 shadow-lg rounded-xl`}
      onClick={() => router.push(`/messageboard/${id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/messageboard/${id}`);
        }
      }}
    >
      <div className="flex-col items-start!">
        <div className="font-thin text-sm pb-2 flex text-brand-black/60">
          {fromAdmin ? (
            <Shield className="h-auto pr-2" />
          ) : (
            <CircleUser className="h-auto pr-2" />
          )}
          <span
            className={`${userIsMessageAuthor ? "text-brand-secondary font-normal" : ""}`}
          >
            {author?.firstName} {author?.lastName}
          </span>
        </div>
        {imageUrl && (
          <Image
            alt={title}
            className="object-cover rounded-xl w-full"
            src={imageUrl}
            width={800}
            height={600}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>

      <div className="pt-0 prose">
        <h2 className="mt-4 text-lg font-semibold ">{title}</h2>
        <p className="text-sm whitespace-pre-line">{slicedText}</p>
      </div>
      <div>
        <div className="flex items-center justify-between w-full">
          <div className="text-xs h-auto text-brand-black/60">
            {formatDate(createdAt)}
          </div>
          {commentCount > 0 && (
            <Tooltip delay={1000}>
              <Tooltip.Trigger>
                <div className="flex">
                  <MessagesSquare className="h-auto mr-1" />
                  {commentCount}
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {commentPreviews.map((comment, index) => (
                  <div key={comment.key}>
                    <div className="py-2">
                      <strong>{comment.author}</strong>: {comment.title}...
                    </div>
                    {index !== commentPreviews.length - 1 && <hr />}
                  </div>
                ))}
              </Tooltip.Content>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
}
