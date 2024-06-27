import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "@nextui-org/react";
import AlertUser from "./AlertUser";
import Link from "next/link";

export default function NotLoggedIn() {
  return (
    <div className="container flex justify-center">
      <AlertUser
        alertTitle="Du er ikke logget inn"
        alertMessage="Du må være logget inn for å se denne siden."
      />
    </div>
  );
}
