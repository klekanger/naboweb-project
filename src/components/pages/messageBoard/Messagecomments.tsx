import { compareClerkAndSanityUser } from "@/lib/compareClerkAndSanityUser";
import { formatDate } from "@/lib/format-date";
import { MESSAGE_BY_ID_QUERYResult } from "@/types/sanity.types";
import { useUser } from "@clerk/nextjs";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Form,
  Input,
  Textarea,
} from "@heroui/react";
import { MessageSquare, User } from "lucide-react";
import { useState } from "react";

export default function MessageComments({
  comments,
  commentCount,
  messageId,
}: {
  comments: NonNullable<MESSAGE_BY_ID_QUERYResult>["comments"];
  commentCount: number;
  messageId: string;
}) {
  const userData = useUser();
  const userId = userData?.user?.id ?? "";
  const [isCreatingComment, setIsCreatingComment] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const response = await fetch("/api/update-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: messageId,
          title: formData.get("title") as string,
          bodyText: formData.get("bodyText") as string,
          userId: userId,
        }),
      });

      const data = await response.json();

      console.log("[update-comment] data: ", data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingComment(false);
    }
  };

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
            comments.map((comment) => {
              const userIsMessageAuthor = compareClerkAndSanityUser({
                clerkUser: userData?.user?.id ?? "",
                sanityUser: comment?.commentAuthor?._id ?? "",
              });

              return (
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
                    {userIsMessageAuthor && (
                      <>
                        <Button size="sm" variant="bordered" className="mt-2">
                          Rediger
                        </Button>

                        <Button
                          size="sm"
                          variant="bordered"
                          className="mt-2 border-brand-danger"
                        >
                          Slett
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </CardBody>
      <CardFooter className="flex flex-col items-start gap-4">
        {!isCreatingComment && (
          <Button onPress={() => setIsCreatingComment(true)}>
            Ny kommentar
          </Button>
        )}

        {isCreatingComment && (
          <Form
            onSubmit={handleSubmit}
            className="w-full max-w-xl"
            validationBehavior="native"
          >
            <h3 className="text-lg font-semibold">Opprett ny kommentar</h3>
            <Input
              label="Tittel"
              name="title"
              isRequired
              errorMessage="Du må skrive inn en tittel"
            />
            <Textarea
              className="w-full"
              name="bodyText"
              label="Skriv kommentaren din her"
              variant="faded"
              isRequired
              errorMessage="Du må skrive inn en kommentar"
            />
            <div className="flex gap-2">
              <Button type="submit">Svar</Button>
              <Button
                variant="bordered"
                onPress={() => setIsCreatingComment(false)}
              >
                Avbryt
              </Button>
            </div>
          </Form>
        )}
      </CardFooter>
    </Card>
  );
}
