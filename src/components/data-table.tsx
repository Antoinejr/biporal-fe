import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader,
  Printer,
} from "lucide-react";
import { useRef, type JSX } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import useExport from "@/hooks/useExport";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading: boolean;
  error: Error | null;
  next: () => void;
  prev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  toolBar?: JSX.Element;
  fileName?: string;
};

const DataTable = <TData, TValue>({
  columns,
  data,
  loading,
  error,
  next,
  prev,
  hasNext,
  hasPrev,
  toolBar,
  fileName,
}: DataTableProps<TData, TValue>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const tableRef = useRef<HTMLTableElement>(null);
  const toPdf = useExport(tableRef.current, fileName ?? "base");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load information. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No data found</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className={cn("grid grid-rows-[auto_1fr_auto]", "gap-2")}>
      <div className={cn(fileName && toolBar ? "grid grid-cols-[auto_1fr]" : "")}>
        {toolBar && toolBar}
        {fileName && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={async function () {
                await toPdf.handleExport();
                return;
              }}
            >
              {toPdf.loading ? (
                <Loader className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <Printer />
              )}
              <span>Download</span>
            </Button>
          </div>
        )}
      </div>
      <ScrollArea className="max-h-[65vh]">
        <Table ref={tableRef} noWrapper>
          <TableHeader className="bg-muted/95 backdrop-blur-sm z-10">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className={cn("flex gap-2 justify-end")}>
        <Button
          size="icon-sm"
          variant="outline"
          disabled={!hasPrev}
          onClick={prev}
        >
          <ArrowLeft className={cn("w-4 h-4")} />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          disabled={!hasNext}
          onClick={next}
        >
          <ArrowRight className={cn("w-4 h-4")} />
        </Button>
      </div>
    </div>
  );
};

export default DataTable;
