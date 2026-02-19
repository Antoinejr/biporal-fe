import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface DisplayErrorProps {
  description: string;
}

function DisplayError({ description }: DisplayErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

export default DisplayError;
