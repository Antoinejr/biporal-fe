import DataTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ChooseMenu from "@/features/ChooseMenu";
import { FundingColumns } from "@/features/FundingColumnDef";
import { cn } from "@/lib/utils";
import { lookupContractors } from "@/services/contractorService";
import { findPayments } from "@/services/paymentService";
import { lookupSites } from "@/services/siteService";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

function Funding() {
  const [page, setPage] = useState(1);
  const [site, setSite] = useState<{
    name: string;
    value: string | undefined;
  }>({ name: "All", value: undefined });
  const [contractor, setContractor] = useState<{
    name: string;
    value: string | undefined;
  }>({ name: "All", value: undefined });
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "payments",
      page,
      site.value,
      contractor.value,
      startDate,
      endDate,
    ],
    queryFn: () =>
      findPayments({
        page: page,
        siteId: site.value,
        contractorId: contractor.value,
        startDate: startDate,
        endDate: endDate,
      }),
  });

  const siteLookupQuery = useQuery({
    queryKey: ["static-sites"],
    queryFn: lookupSites,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const siteLookupTable = useMemo(
    () => [{ name: "All", value: undefined }, ...(siteLookupQuery.data ?? [])],
    [siteLookupQuery.data],
  );

  const contractorLookupQuery = useQuery({
    queryKey: ["static-contractors"],
    queryFn: lookupContractors,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const contractorLookupTable = useMemo(
    () => [
      { name: "All", value: undefined },
      ...(contractorLookupQuery.data ?? []),
    ],
    [contractorLookupQuery.data],
  );

  const prevPage = useCallback(() => {
    if (!data) return;
    if (page <= 1) return;
    setPage(page - 1);
  }, [data, page]);

  const nextPage = useCallback(() => {
    if (!data) return;
    if (page >= data.pagination.totalPages) return;
    setPage(page + 1);
  }, [data, page]);

  const toolBar = useMemo(() => {
    const hasStartDate = startDate !== "";
    const hasEndDate = endDate !== "";
    const hasSiteFilter = site.value !== undefined;
    const hasContractorFilter = contractor.value !== undefined;
    return (
      <div className={cn("flex gap-1 justify-between")}>
        <div className={cn("flex gap-1 min-w-md")}>
          <div className="flex justify-center items-center gap-2">
            <Label htmlFor="startDate">Start Date:</Label>
            <div className="relative">
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                className={cn("bg-white", "max-w-sm")}
                disabled={isLoading}
              />
              {hasStartDate && (
                <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                  *
                </span>
              )}
            </div>

            <div className="flex justify-center items-center gap-2">
              <Label htmlFor="endDate">End Date:</Label>
            </div>
            <div className="relative">
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                className={cn("bg-white", "max-w-sm")}
                disabled={isLoading}
              />
              {hasEndDate && (
                <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                  *
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <ChooseMenu
              options={siteLookupTable}
              state={site.value}
              handleSelect={setSite}
              disabled={isLoading}
              label="Site"
            />
            {hasSiteFilter && (
              <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                *
              </span>
            )}
          </div>
          <div className="relative">
            <ChooseMenu
              options={contractorLookupTable}
              state={contractor.value}
              handleSelect={setContractor}
              disabled={isLoading}
              label="Contractor"
            />
            {hasContractorFilter && (
              <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                *
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    startDate,
    endDate,
    site.value,
    contractor.value,
    siteLookupTable,
    contractorLookupTable,
    isLoading,
  ]);

  return (
    <div className="px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fundings</h1>
        <p className="text-muted-foreground">Filter through Payments</p>
      </div>
      <DataTable
        columns={FundingColumns}
        data={data?.data ?? []}
        loading={isLoading}
        error={error}
        toolBar={toolBar}
        next={nextPage}
        prev={prevPage}
        hasNext={data ? page < data.pagination.totalPages : false}
        hasPrev={page > 1}
        fileName="funding"
      />
    </div>
  );
}

export default Funding;
