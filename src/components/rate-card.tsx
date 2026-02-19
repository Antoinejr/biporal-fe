import RateForm from "@/features/RateForm";
import { formatCurrency } from "@/lib/utils";
import { Banknote } from "lucide-react";
import { Card } from "./ui/card";
import type { RateType } from "@/lib/adminTypes";

interface RateCardProps {
  rateData: RateType;
}

function RateCard({ rateData }: RateCardProps) {
  return (
    <div className="space-y-6">
      {/* Rate Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Current Price
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {formatCurrency(rateData.rate)}
                </p>
              </div>
            </div>
            <RateForm />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RateCard;
