import { ShieldAlert } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import StrikeLimitForm from "@/features/StrikeLimitForm";

function SuspensionPolicyCard({ limit }: { limit: number }) {
  return (
    <Card className="border-l-4 border-l-destructive">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Automatic Access Suspension
          </CardTitle>
          <CardDescription>
            Workers will be automatically blocked from the gate after reaching
            this limit of late exits.
          </CardDescription>
        </div>
        <StrikeLimitForm />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tighter">{limit}</span>
          <span className="text-muted-foreground font-medium">
            Strikes allowed
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
export default SuspensionPolicyCard;
