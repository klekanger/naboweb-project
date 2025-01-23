import { formatDate } from "@/lib/format-date";
import { MESSAGE_BY_ID_QUERYResult } from "@/types/sanity.types";
import { Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { MessageSquare, User } from "lucide-react";

export default function MessageComments({
  comments,
  commentCount,
}: {
  comments: NonNullable<MESSAGE_BY_ID_QUERYResult>["comments"];
  commentCount: number;
}) {
  console.log("comment count", commentCount);
  console.log("comments", comments);

  return (
    <Card className="lg:p-4">
      <CardHeader className="flex-col !items-start ">
        <h2 className="text-lg font-semibold flex">
          <MessageSquare className="h-auto mr-2" />
          Kommentarer ({commentCount})
        </h2>
      </CardHeader>

      <CardBody>
        <div className="prose lg:prose-xl pb-8">
          {comments &&
            comments.length > 0 &&
            comments.map((comment) => (
              <div
                key={comment._key}
                className="border-b border-brand-black/10 mt-4 pb-8"
              >
                <div className="flex justify-start max-w-3xl mx-auto text-sm not-prose text-brand-black/50 pt-2">
                  {comment?.commentAuthor && (
                    <>
                      <User className="inline-block mr-2" size={16} />
                      <span className="inline-block">
                        {`${comment?.commentAuthor?.firstName} ${comment?.commentAuthor?.lastName}`}
                      </span>
                      <span className="px-2 text-base"> · </span>
                    </>
                  )}
                  {comment?.published && (
                    <time
                      dateTime={String(comment?.published)}
                      className="inline-block"
                    >
                      {formatDate(comment?.published)}
                    </time>
                  )}
                </div>

                <h3 className="font-semibold not-prose text-xl md:text-2xl mb-4">
                  {comment.commentTitle}
                </h3>
                <p className="prose">{comment.commentText}</p>
                <div className="flex justify-end gap-2">
                  <Button size="sm" className="mt-2">
                    Svar
                  </Button>
                  <Button size="sm" className="mt-2">
                    Rediger
                  </Button>
                  <Button size="sm" className="mt-2">
                    Slett
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </CardBody>
    </Card>
  );
}
