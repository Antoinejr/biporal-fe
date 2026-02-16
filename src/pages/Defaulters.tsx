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
import { DefaultersColumns } from "@/features/DefaultersColumnDef";
import { cn } from "@/lib/utils";
import {
  getDefaulters,
  getDefaultersCsv,
  getDefaultersPdf,
  getDefaultersXlsx,
  type InfractionReason,
} from "@/services/defaultersService";
import { useQuery } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  FileText,
  Loader,
  Printer,
  Sheet,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

function Defaulters() {
  const [downloading, setIsDownloading] = useState(false);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<{
    name: string;
    value: InfractionReason | undefined;
  }>({ name: "All", value: undefined });

  const { data, isLoading, error } = useQuery({
    queryKey: ["defaulters", page, startDate, endDate, reason.value],
    queryFn: () =>
      getDefaulters({
        page,
        reason: reason.value,
        startDate,
        endDate,
      }),
  });

  async function downloadPdf() {
    try {
      setIsDownloading(true);
      await getDefaultersPdf({
        page: page,
        startDate: startDate,
        endDate: endDate,
        reason: reason.value,
      });
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
      await getDefaultersCsv({
        page: page,
        startDate: startDate,
        endDate: endDate,
        reason: reason.value,
      });
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
      await getDefaultersXlsx({
        page: page,
        startDate: startDate,
        endDate: endDate,
        reason: reason.value,
      });
      return;
    } catch (err) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  }

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
    const hasReasonFilter = reason.value !== undefined;
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
                { name: "Late Exit", value: "LATE_TAPOUT" },
                { name: "No Exit", value: "NO_TAPOUT" },
              ]}
              state={reason.value}
              handleSelect={setReason}
              disabled={isLoading}
              label="Reason"
            />
            {hasReasonFilter && (
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
  }, [startDate, endDate, reason.value, isLoading]);
  return (
    <div className="px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Defaulters</h1>
        <p className="text-muted-foreground">Filter through Defaulters</p>
      </div>
      <DataTable
        columns={DefaultersColumns}
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

export default Defaulters;
