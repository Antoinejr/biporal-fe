import type { JSX } from "react";
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
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import DisplayLoading from "./loading";
import DisplayError from "./error";
import type { PageBasedPagination } from "@/lib/baseTypes";

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
  metadata?: PageBasedPagination;
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
  metadata,
}: DataTableProps<TData, TValue>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <DisplayLoading />;
  }

  if (error) {
    return (
      <DisplayError description="Failed to load information. Please try again" />
    );
  }

  const totalResults = metadata ? metadata.total : 1;
  const currPage = metadata ? metadata.page : 1;
  const totalPages = metadata ? metadata.totalPages : 1;
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
      <div
        className={cn(metadata ? "flex justify-between" : "flex justify-end")}
      >
        {metadata ? (
          <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
            <span>Showing</span>
            <span className="text-slate-900">{totalResults}</span>
            <span>results.</span>
            <span>Page</span>
            <span className="text-slate-900">{currPage}</span>
            <span>of</span>
            <span className="text-slate-900">{totalPages}</span>
          </div>
        ) : null}
        <div className="flex gap-2">
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
    </div>
  );
};

export default DataTable;
