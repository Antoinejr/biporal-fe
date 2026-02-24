import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

interface FormSuccessErrors {
  hasSuccess: boolean;
  title: string;
  message: string;
}
const FormSuccess = ({ hasSuccess, title, message }: FormSuccessErrors) => {
  if (!hasSuccess) {
    return null;
  }

  return (
    <Alert
      variant="default"
      className="flex items-center text-green-700 animate-in ease-out fade-in slide-in-from-top-2 duration-300"
    >
      <AlertCircle className="h-4 w-4" />
      <div className="ml-2">
        <AlertTitle className="text-md font-bold tracking-tight">
          {title}
        </AlertTitle>
        <AlertDescription className="italics text-sm font-bold opacity-90 leading-relaxed">
          {message}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default FormSuccess;
