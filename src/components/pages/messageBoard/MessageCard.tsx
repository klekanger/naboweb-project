import { formatDate } from "@/lib/format-date";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Image,
  Tooltip,
} from "@nextui-org/react";
import { PortableTextBlock } from "@portabletext/types";
import { CircleUser, MessagesSquare, Shield } from "lucide-react";
import { toPlainText } from "next-sanity";

type MessageCardProps = {
  title: string;
  description: PortableTextBlock;
  commentCount: number;
  url?: string;
  imageUrl: string | null;
  author?: { firstName?: string; lastName?: string };
  fromAdmin?: boolean;
  createdAt: string;
  comments: Array<{
    _key: string;
    commentText: string | null;
    commentTitle: string | null;
    commentAuthor: {
      _id: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
  }> | null;
};

export default function MessageCard({
  title,
  description,
  commentCount,
  url,
  imageUrl,
  author,
  fromAdmin,
  createdAt,
  comments,
}: MessageCardProps) {
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
      isPressable
      onPress={() => console.log("clicked")}
      className={`p-2 ${imageUrl ? "row-span-2" : "row-span-1"} `}
    >
      <CardHeader className="flex-col !items-start hover:">
        <div className="font-thin text-sm pb-2 flex text-brand-black/60">
          {fromAdmin ? (
            <Shield className="h-auto pr-2" />
          ) : (
            <CircleUser className="h-auto pr-2" />
          )}
          {author?.firstName} {author?.lastName}
        </div>
        {imageUrl && (
          <Image
            alt="Card background"
            className="object-cover rounded-xl"
            src={imageUrl}
            width={800}
            height={600}
          />
        )}
      </CardHeader>

      <CardBody className="pt-0 prose">
        <h2 className="mt-4 text-lg font-semibold ">{title}</h2>
        <p className="text-sm whitespace-pre-line">{slicedText}</p>
      </CardBody>
      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <div className="text-xs h-auto text-brand-black/60">
            {formatDate(createdAt)}
          </div>
          {commentCount > 0 && (
            <Tooltip
              content={
                <div>
                  {commentPreviews.map((comment, index) => (
                    <>
                      <div key={comment.key} className="py-2">
                        <strong>{comment.author}</strong>: {comment.title}...
                      </div>
                      {index !== commentPreviews.length - 1 && <hr />}
                    </>
                  ))}
                </div>
              }
            >
              <div className="flex">
                <MessagesSquare className="h-auto mr-1" />
                {commentCount}
              </div>
            </Tooltip>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
