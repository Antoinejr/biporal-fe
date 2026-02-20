import DisplayError from "@/components/error";
import DisplayLoading from "@/components/loading";
import PasswordCard from "@/components/password-card";
import PolicyCard from "@/components/policy-card";
import RateCard from "@/components/rate-card";
import SuspensionPolicyCard from "@/components/suspension-card";
import type { RateType } from "@/lib/adminTypes";
import { findPolicy, findRate } from "@/services/adminService";
import { getWarning } from "@/services/blocklistService";
import { useQuery } from "@tanstack/react-query";

function Setting() {
  const gateSchedule = useQuery({
    queryKey: ["policy"],
    queryFn: findPolicy,
  });
  const pricing = useQuery({
    queryKey: ["rate"],
    queryFn: findRate,
  });
  const strikeLimit = useQuery({
    queryKey: ["strikeLimit"],
    queryFn: getWarning,
  });

  const isLoading =
    gateSchedule.isLoading || pricing.isLoading || strikeLimit.isLoading;
  const hasError =
    !!gateSchedule.error || !!pricing.error || !!strikeLimit.error;

  if (isLoading) {
    return <DisplayLoading />;
  }

  if (hasError) {
    return (
      <DisplayError description=" Failed to load settings. Please try again." />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
        <header className="border-b pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Access Management Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Configure gate access hours, entry fees, and security enforcement
            rules.
          </p>
        </header>

        <div className="grid gap-8">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Access Operations
            </h2>
            <div className="grid gap-6">
              <RateCard rateData={pricing.data ?? ({} as RateType)} />
              <SuspensionPolicyCard limit={strikeLimit.data?.limit ?? 0} />
              <PolicyCard policyData={gateSchedule?.data ?? []} />
            </div>
          </section>

          <section className="space-y-4 pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Account Security
            </h2>
            <PasswordCard />
          </section>
        </div>
      </div>
    </div>
  );
}

export default Setting;
