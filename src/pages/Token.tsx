import DataTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ChooseMenu from "@/features/ChooseMenu";
import { TokenColumns } from "@/features/TokenColumnDef";
import type { Category } from "@/lib/activityLogsTypes";
import { cn } from "@/lib/utils";
import { lookupContractors } from "@/services/contractorService";
import { lookupSites } from "@/services/siteService";
import { findAll } from "@/services/tokenService";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

function Token() {
  const [page, setPage] = useState(1);
  const [isExpired, setIsExpired] = useState<{
    name: string;
    value: boolean | undefined;
  }>({
    name: "All",
    value: undefined,
  });
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [categoryState, setCategory] = useState<{
    name: string;
    value: Category | undefined;
  }>({ name: "All", value: undefined });
  const [site, setSite] = useState<{
    name: string;
    value: string | undefined;
  }>({
    name: "All",
    value: undefined,
  });

  const [contractor, setContractor] = useState<{
    name: string;
    value: string | undefined;
  }>({
    name: "All",
    value: undefined,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "tokens",
      page,
      isExpired,
      startDate,
      endDate,
      categoryState,
      site,
      contractor,
    ],
    queryFn: () =>
      findAll({
        page: page,
        startDate: startDate,
        endDate: endDate,
        siteId: site.value,
        contractorId: contractor.value,
        category: categoryState.value,
        isExpired: isExpired.value,
      }),
  });

  const contractorLookupQuery = useQuery({
    queryKey: ["static-contractors"],
    queryFn: lookupContractors,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const siteLookupQuery = useQuery({
    queryKey: ["static-sites"],
    queryFn: lookupSites,
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

  const siteLookupTable = useMemo(
    () => [{ name: "All", value: undefined }, ...(siteLookupQuery.data ?? [])],
    [siteLookupQuery.data],
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
    const hasExpiredFilter = isExpired.value !== undefined;
    const hasCategoryFilter = categoryState.value !== undefined;
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
              options={[
                { name: "All", value: undefined },
                { name: "Expired", value: true },
                { name: "Active", value: false },
              ]}
              state={isExpired.value}
              handleSelect={setIsExpired}
              disabled={isLoading}
              label="Status"
            />
            {hasExpiredFilter && (
              <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                *
              </span>
            )}
          </div>
          <div className="relative">
            <ChooseMenu
              options={[
                { name: "All", value: undefined },
                // { name: "Resident", value: "RESIDENT" as Category },
                // { name: "Worker", value: "WORKER" as Category },
                // { name: "Dependent", value: "DEPENDENT" as Category },
                { name: "Supervisor", value: "SUPERVISOR" as Category },
                { name: "Artisan", value: "ARTISAN" as Category },
              ]}
              state={categoryState.value}
              handleSelect={setCategory}
              disabled={isLoading}
              label="Category"
            />
            {hasCategoryFilter && (
              <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                *
              </span>
            )}
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
    isExpired.value,
    categoryState.value,
    site.value,
    contractor.value,
    isLoading,
    siteLookupTable,
    contractorLookupTable,
  ]);
  return (
    <div className="px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tokens</h1>
        <p className="text-muted-foreground">
          Manage your organization's Tokens
        </p>
      </div>
      <DataTable
        columns={TokenColumns}
        data={data?.data ?? []}
        loading={isLoading}
        error={error}
        toolBar={toolBar}
        next={nextPage}
        prev={prevPage}
        hasNext={data ? page < data.pagination.totalPages : false}
        hasPrev={page > 1}
      />
    </div>
  );
}
export default Token;
