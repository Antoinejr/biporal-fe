import DataTable from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChooseMenu from "@/features/ChooseMenu";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  getEngagements,
  getEngagementsCsv,
  getEngagementsPdf,
  getEngagementsXlsx,
  lookupContractors,
  type Engagement,
} from "@/services/contractorService";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Loader,
  Printer,
  FileText,
  FileSpreadsheet,
  Sheet,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const EngagementsColumnDef: ColumnDef<Engagement>[] = [
  {
    accessorKey: "contractor",
    header: "Contractor",
    accessorFn: (row) => row.contractor.toUpperCase(),
  },
  {
    accessorKey: "site",
    header: "Site",
    accessorFn: (row) => row.site.toUpperCase(),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    accessorFn: (row) => formatCurrency(row.balance, { showSymbol: true }),
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    accessorFn: (row) => formatDateTime(row.startDate),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    accessorFn: (row) => (row.endDate ? formatDateTime(row.endDate) : "N/A"),
  },
  { accessorKey: "supervisorCount", header: "Number of Supervisors" },
];

const Engagements = () => {
  const [page, setPage] = useState(1);
  const [contractor, setContractor] = useState<{
    name: string;
    value: string | undefined;
  }>({
    name: "All",
    value: undefined,
  });
  const [downloading, setDownloading] = useState<boolean>(false);

  const buildQueryArguments = () => {
    return {
      page: page,
      contractor: contractor.value,
    };
  };
  const { data, isLoading, error } = useQuery({
    queryKey: ["engagements", page, contractor.value],
    queryFn: () => getEngagements(buildQueryArguments()),
  });

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

  const downloadPdf = async () => {
    try {
      setDownloading(true);
      await getEngagementsPdf(buildQueryArguments());
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const downloadCsv = async () => {
    try {
      setDownloading(true);
      await getEngagementsCsv(buildQueryArguments());
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const downloadXlsx = async () => {
    try {
      setDownloading(true);
      await getEngagementsXlsx(buildQueryArguments());
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const prevPage = useCallback(() => {
    if (!data || page <= 1) return;
    setPage(page - 1);
  }, [data, page]);

  const nextPage = useCallback(() => {
    if (!data || page >= data.pagination.totalPages) return;
    setPage(page + 1);
  }, [data, page]);

  const toolBar = useMemo(() => {
    const hasContractorFilter = contractor.value ? true : false;
    return (
      <div className="flex justify-between">
        <div>
          <div className="relative">
            <ChooseMenu
              options={contractorLookupTable}
              state={contractor.value}
              disabled={isLoading}
              handleSelect={setContractor}
              label="Contractor"
            />
            {hasContractorFilter && (
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
            <DropdownMenuItem onClick={() => downloadPdf()}>
              <FileText className="w-4 h-4" />
              <span>Pdf</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => downloadCsv()}>
              <FileSpreadsheet className="w-4 h-4" />
              <span> Csv </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => downloadXlsx()}>
              <Sheet className="w-4 h-4" />
              <span>Excel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }, [isLoading, contractor.value]);

  return (
    <div className="px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">CONTRACTOR REPORT</h1>
        <p className="text-muted-foreground">Filter through Contractors</p>
      </div>
      <DataTable
        columns={EngagementsColumnDef}
        data={data?.data ?? []}
        toolBar={toolBar}
        hasNext={data ? page < data.pagination.totalPages : false}
        hasPrev={page > 1}
        loading={isLoading}
        error={error}
        next={nextPage}
        prev={prevPage}
      />
    </div>
  );
};

export default Engagements;
