import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Textarea,
  Checkbox,
} from "@nextui-org/react";
import { MessagesSquare } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { currentUserRoles } from "@/sanity/lib/utils";
import { useState } from "react";

type MessageType = {
  title: string;
  bodyText: string;
  author: {
    firstName: "";
    lastName: "";
  };
};

export default async function NewMessage() {
  const user = await currentUser();
  const [message, setMessage] = useState<MessageType>({
    title: "",
    bodyText: "",
    author: {
      firstName: "",
      lastName: "",
    },
  });

  if (!user) {
    return null;
  }

  const { firstName, lastName } = user;
  const { isAdmin } = currentUserRoles(user);

  return (
    <>
      <Card className="p-2 py-8 mb-16">
        <CardHeader className="flex gap-3">
          <div className="border-r-1 border-black/20 pr-4">
            <MessagesSquare />{" "}
          </div>
          <h1 className="text-xl lg:text-3xl prose lg:prose-lg ">
            Opprett nytt innlegg
          </h1>
        </CardHeader>
        <CardBody className="prose lg:prose-lg">
          <Textarea
            isRequired
            label="Skriv inn innlegget ditt her"
            labelPlacement="inside"
          />
          <p className="text-xs">
            Du publiserer som: {firstName} {lastName}
          </p>
        </CardBody>

        <CardFooter className="flex gap-4">
          <Button color="danger" as={Link} href="/messageboard">
            Avbryt
          </Button>
          <Button color="primary">Send inn</Button>
          {isAdmin && (
            <Checkbox isSelected>Publiser på vegne av styret</Checkbox>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
