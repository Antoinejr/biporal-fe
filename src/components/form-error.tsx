import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { getFriendlyErrorMessage } from "@/lib/error";

interface FormErrorProps {
  error: unknown;
  title?: string;
}

function FormError({ error, title = "Something went wrong" }: FormErrorProps) {
  if (!error) {
    return null;
  }
  return (
    <Alert
      variant="destructive"
      className="flex items-center animate-in ease-out fade-in slide-in-from-top-2 duration-300"
    >
      <AlertCircle className="h-4 w-4" />
      <div className="ml-2">
        <AlertTitle className="text-md font-bold tracking-tight">
          {title}
        </AlertTitle>
        <AlertDescription className="text-xs opacity-90 leading-relaxed">
          {getFriendlyErrorMessage(error)}
        </AlertDescription>
      </div>
    </Alert>
  );
}

export default FormError;
