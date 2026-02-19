import { Loader } from "lucide-react";

function DisplayLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default DisplayLoading;
