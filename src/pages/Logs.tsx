import DataTable from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ChooseMenu from "@/features/ChooseMenu";
import { ReportLogsColumns } from "@/features/ReportColumnDef";
import type { Category } from "@/lib/activityLogsTypes";
import {
  AccessStatusEnum,
  LogStatusEnum,
  type AccessStatus,
  type LogStatus,
} from "@/lib/dashboardType";
import { cn } from "@/lib/utils";
import {
  getLogCsv,
  getLogPdf,
  getLogSnapshot,
  getLogXlsx,
} from "@/services/dashboardService";
import { lookupSites } from "@/services/siteService";
import { useQuery } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  FileText,
  Loader,
  Printer,
  Sheet,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

function Logs() {
  const [downloading, setIsDownloading] = useState(false);
  const [page, setPage] = useState(1);
  const [type, setType] = useState<{
    name: string;
    value: string | undefined;
  }>({ name: "All", value: undefined });
  const [logStatus, setLogStatus] = useState<{
    name: string;
    value: LogStatus | undefined;
  }>({
    name: "All",
    value: undefined,
  });
  const [accessStatus, setAccessStatus] = useState<{
    name: string;
    value: AccessStatus | undefined;
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

  const getFieldsForDownload = () => {
    return {
      page: page,
      action: type.value?.toUpperCase(),
      accessStatus: accessStatus.value,
      logStatus: logStatus.value,
      startDate: startDate,
      endDate: endDate,
      category: categoryState.value,
      siteId: site.value,
    };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "reports",
      page,
      type.value,
      startDate,
      endDate,
      categoryState.value,
      site.value,
      accessStatus.value,
      logStatus.value,
    ],
    queryFn: () => getLogSnapshot(getFieldsForDownload()),
  });

  async function downloadPdf() {
    try {
      setIsDownloading(true);
      await getLogPdf(getFieldsForDownload());
      return;
    } catch (err) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  }

  async function downloadCsv() {
    try {
      setIsDownloading(true);
      await getLogCsv(getFieldsForDownload());
      return;
    } catch (err) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  }

  async function downloadXlsx() {
    try {
      setIsDownloading(true);
      await getLogXlsx(getFieldsForDownload());
      return;
    } catch (err) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  }

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
    const hasActionFilter = type.value !== undefined;
    const hasAccessStatusFilter = accessStatus.value !== undefined;
    const hasLogStatusFilter = logStatus.value !== undefined;
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
              state={type.value}
              handleSelect={setType}
              disabled={isLoading}
              label="Type"
            />
            {hasActionFilter && (
              <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                *
              </span>
            )}
          </div>
          <div className="relative">
            <ChooseMenu
              options={[
                { name: "All", value: undefined },
                { name: "Exited", value: LogStatusEnum.EXITED },
                { name: "Overstayed", value: LogStatusEnum.OVERSTAYED },
                { name: "Still In", value: LogStatusEnum.STILL_IN },
              ]}
              state={logStatus.value}
              handleSelect={setLogStatus}
              disabled={isLoading}
              label="Status"
            />
            {hasLogStatusFilter && (
              <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                *
              </span>
            )}
          </div>
          <div className="relative">
            <ChooseMenu
              options={[
                { name: "All", value: undefined },
                { name: "Granted", value: AccessStatusEnum.GRANTED },
                { name: "Rejected", value: AccessStatusEnum.REJECTED },
                { name: "Flagged", value: AccessStatusEnum.FLAGGED },
              ]}
              state={accessStatus.value}
              handleSelect={setAccessStatus}
              disabled={isLoading}
              label="Access"
            />
            {hasAccessStatusFilter && (
              <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                *
              </span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {downloading ? (
                <Loader className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <Printer />
              )}
              <span>Download</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={async function () {
                await downloadPdf();
                return;
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              <span>Pdf</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async function () {
                await downloadCsv();
                return;
              }}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              <span> Csv </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async function () {
                await downloadXlsx();
                return;
              }}
            >
              <Sheet className="w-4 h-4 mr-2" />
              <span>Excel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }, [
    startDate,
    endDate,
    accessStatus.value,
    logStatus.value,
    categoryState.value,
    site.value,
    type.value,
    siteLookupTable,
    isLoading,
  ]);
  return (
    <div className="px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ACCESS LOGS</h1>
        <p className="text-muted-foreground">Filter through access logs</p>
      </div>
      <DataTable
        columns={ReportLogsColumns}
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
