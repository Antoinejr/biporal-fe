import { Loader, LoaderCircle } from "lucide-react";

interface DisplayLoadingProps {
  minimal?: boolean;
}
function DisplayLoading({ minimal = false }: DisplayLoadingProps) {
  if (minimal) {
    return (
      <div className="flex w-full items-center justify-center py-4">
        <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground/50" />
      </div>
    );
  } else {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
}

export default DisplayLoading;
