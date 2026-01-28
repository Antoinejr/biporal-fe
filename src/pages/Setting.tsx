import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PolicyForm from "@/features/PolicyForm";
import RateForm from "@/features/RateForm";
import UpdateAdminPasswordForm from "@/features/UpdateAdminPasswordForm";
import { formatCurrency } from "@/lib/utils";
import { findPolicy, findRate } from "@/services/adminService";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Banknote, Clock, Loader, Users } from "lucide-react";

function Setting() {
  const policyQuery = useQuery({
    queryKey: ["policy"],
    queryFn: findPolicy,
  });
  const rateQuery = useQuery({
    queryKey: ["rate"],
    queryFn: findRate,
  });

  if (policyQuery.isLoading || rateQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (policyQuery.error || rateQuery.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load person details. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization's token rate and entry/exit policies
          </p>
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
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
                        Current Rate
                      </p>
                      <p className="text-3xl font-bold tracking-tight">
                        {formatCurrency(rateQuery.data?.rate ?? 0)}
                      </p>
                    </div>
                  </div>
                  <RateForm />
                </div>
              </div>
            </Card>
          </div>
          {/* Policy Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Policies
                  </CardTitle>
                  <PolicyForm />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {policyQuery.data && policyQuery.data.length > 0 ? (
                  policyQuery.data.map((policy) => (
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
                    <p className="text-sm">
                      Add your first policy using the form
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xl font-bold"> Update Admin Password </CardTitle>
                  <UpdateAdminPasswordForm />
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;
