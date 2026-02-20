import PolicyForm from "@/features/PolicyForm";
import { Users, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import type { PolicyType } from "@/lib/adminTypes";

interface PolicyCardProps {
  policyData: PolicyType[];
}

function PolicyCard({ policyData }: PolicyCardProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Gate Access Rules
            </CardTitle>
            <PolicyForm />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {policyData.length > 0 ? (
            policyData.map((policy) => (
              <div
                key={policy.id}
                className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-semibold">{policy.role}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {policy.entryTime}
                    </span>
                    <span className="text-muted-foreground/50">→</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {policy.exitTime}
                    </span>
                  </div>
                </div>
                <PolicyForm policy={policy} />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No policies set</p>
              <p className="text-sm">Add your first policy using the form</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PolicyCard;
