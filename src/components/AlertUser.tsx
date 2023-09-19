'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from '@nextui-org/react';
import { AlertCircle } from 'lucide-react';

type AlertUserProps = {
  alertMessage: string;
  alertTitle: string;
};

export default function AlertUser({
  alertMessage,
  alertTitle,
}: AlertUserProps) {
  if (!alertMessage || !alertTitle) return null;

  return (
    <Card className="max-w-[400px] bg-brand-dark-warning text-brand-black dark:bg-brand-dark-warning">
      <CardHeader className="text-brand-primaryLight flex gap-3">
        <AlertCircle size={24} />
        <h3>{alertTitle}</h3>
      </CardHeader>
      <Divider />
      <CardBody>
        <p className="">{alertMessage}</p>
      </CardBody>
    </Card>
  );
}
