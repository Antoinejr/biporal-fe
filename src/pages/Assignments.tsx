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
import { formatDateTime } from "@/lib/utils";
import {
  getAssignments,
  getAssignmentsCsv,
  getAssignmentsPdf,
  getAssignmentsXlsx,
  type Assignment,
} from "@/services/personService";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Loader,
  Printer,
  FileText,
  FileSpreadsheet,
  Sheet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const AssignmentsColumn: ColumnDef<Assignment>[] = [
  {
    header: "Supervisor",
    accessorFn: (row) =>
      `${row.firstName.toUpperCase()} ${row.lastName.toUpperCase()}`,
  },
  {
    header: "Contractor",
    accessorFn: (row) => row.contractor.toUpperCase(),
  },
  {
    header: "Site",
    accessorFn: (row) => row.site.toUpperCase(),
  },
  {
    header: "Start Date",
    accessorFn: (row) => formatDateTime(row.startDate),
  },
  {
    header: "End Date",
    accessorFn: (row) => (row.endDate ? formatDateTime(row.endDate) : "N/A"),
  },
];

const Assignments = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [downloading, setDownloading] = useState<boolean>(false);

  const downloadPdf = async () => {
    try {
      setDownloading(true);
      await getAssignmentsPdf(collateAssigmentQuery());
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const downloadCsv = async () => {
    try {
      setDownloading(true);
      await getAssignmentsCsv(collateAssigmentQuery());
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const downloadXlsx = async () => {
    try {
      setDownloading(true);
      await getAssignmentsXlsx(collateAssigmentQuery());
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const collateAssigmentQuery = () => ({
    page: page,
    search: search,
  });
  const { data, isLoading, error } = useQuery({
    queryKey: ["assignments", search],
    queryFn: () => getAssignments(collateAssigmentQuery()),
  });

  const [inputValue, setInputValue] = useState(search);
  const timeoutRef = useRef<number | undefined>(undefined);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const newTimeout = setTimeout(() => {
        setSearch(value);
        setPage(1);
      }, 1000);
      timeoutRef.current = newTimeout;
    },
    [setSearch, setPage],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const prevPage = useCallback(() => {
    if (!data || page <= 1) return;
    setPage(page - 1);
  }, [data, page]);

  const nextPage = useCallback(() => {
    if (!data || page >= data.pagination.totalPages) return;
    setPage(page + 1);
  }, [data, page]);

  const toolBar = useMemo(() => {
    const disable = isLoading || !!error;
    return (
      <div className="flex justify-between">
        <div className="flex w-full">
          <Input
            className="bg-white max-w-sm"
            value={inputValue}
            onChange={handleTextChange}
            placeholder="Search..."
            disabled={disable}
          />
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
              <span>Csv</span>
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
  }, [isLoading, error, inputValue]);

  return (
    <div className="px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">SUPERVISOR REPORT</h1>
        <p className="text-muted-foreground">Filter through Supervisors</p>
      </div>
      <DataTable
        columns={AssignmentsColumn}
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
};

export default Assignments;
