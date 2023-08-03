import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    <div className="mt-16 w-full md:w-1/2">
      <Alert variant={'destructive'}>
        <AlertCircle className="h-5 w-4" />
        <AlertTitle>{alertTitle}</AlertTitle>
        <AlertDescription className="pt-4 leading-normal">
          {alertMessage}
        </AlertDescription>
      </Alert>
    </div>
  );
}
