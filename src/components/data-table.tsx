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
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import type { JSX } from "react";

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
}: DataTableProps<TData, TValue>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
      {toolBar && toolBar}
      <ScrollArea className="max-h-[65vh]">
        <Table noWrapper>
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
