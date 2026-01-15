import DataTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActivityLogsColumns } from "@/features/ActivityLogsColumnDef";
import ChooseMenu from "@/features/ChooseMenu";
import type { Category } from "@/lib/activityLogsTypes";
import { cn } from "@/lib/utils";
import { getLogSnapshot } from "@/services/dashboardService";
import { lookupSites } from "@/services/siteService";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

function Logs() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<{
    name: string;
    value: string | undefined;
  }>({ name: "All", value: undefined });
  const [isRejected, setIsRejected] = useState<{
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

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "reports",
      page,
      action,
      isRejected,
      startDate,
      endDate,
      categoryState,
      site.value,
    ],
    queryFn: () =>
      getLogSnapshot({
        page: page,
        action: action.value?.toUpperCase(),
        isRejected: isRejected.value,
        startDate: startDate,
        endDate: endDate,
        category: categoryState.value,
        siteId: site.value,
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
    const hasActionFilter = action.value !== undefined;
    const hasRejectedFilter = isRejected.value !== undefined;
    const hasCategoryFilter = categoryState.value !== undefined;
    const hasSiteFilter = site.value !== undefined;
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
                { name: "Granted", value: false },
                { name: "Rejected", value: true },
              ]}
              state={isRejected.value}
              handleSelect={setIsRejected}
              disabled={isLoading}
              label="Log Status"
            />
            {hasRejectedFilter && (
              <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                *
              </span>
            )}
          </div>
          <div className="relative">
            <ChooseMenu
              options={[
                { name: "All", value: undefined },
                { name: "Resident", value: "RESIDENT" as Category },
                { name: "Worker", value: "WORKER" as Category },
                { name: "Dependent", value: "DEPENDENT" as Category },
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
              options={[
                { name: "All", value: undefined },
                { name: "Entry", value: "IN" },
                { name: "Exit", value: "OUT" },
              ]}
              state={action.value}
              handleSelect={setAction}
              disabled={isLoading}
              label="Action"
            />
            {hasActionFilter && (
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
    isRejected.value,
    categoryState.value,
    site.value,
    action.value,
    siteLookupTable,
    isLoading,
  ]);
  return (
    <div className="px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Access Logs</h1>
        <p className="text-muted-foreground">Filter through access logs</p>
      </div>
      <DataTable
        columns={ActivityLogsColumns}
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
export default Logs;
