import { formatDate } from "@/lib/format-date";
import {
  ChatBubbleLeftIcon,
  StarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Image,
} from "@nextui-org/react";
import { PortableTextBlock } from "@portabletext/types";
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
}: MessageCardProps) {
  const textLength = imageUrl ? 100 : 300;
  const plainText = toPlainText(description);
  const slicedText =
    plainText.length > textLength
      ? plainText.slice(0, textLength).concat("[...]")
      : plainText;

  return (
    <Card
      isPressable
      onPress={() => console.log("clicked")}
      className={`p-2 ${imageUrl ? "row-span-2" : "row-span-1"}`}
    >
      <CardHeader className="flex-col !items-start hover:">
        <div className="font-thin text-sm pb-2 flex text-brand-black/60">
          {fromAdmin ? (
            <StarIcon height={16} className="h-auto pr-2" />
          ) : (
            <UserCircleIcon height={16} className="h-auto pr-2" />
          )}
          {author?.firstName} {author?.lastName}
        </div>
        {imageUrl && (
          <Image
            alt="Card background"
            className="object-cover rounded-xl"
            src={imageUrl}
            width={800}
            height={450}
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
            <div className="flex">
              <ChatBubbleLeftIcon className="size-6 h-auto mr-2" />
              {commentCount}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
