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

  return (
    <div className={cn("grid grid=rows-[auto_1fr_auto]", "gap-2")}>
      {toolBar && toolBar}
      <Table>
        <TableHeader>
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
                <TableCell key={cell.id} className="text-[16px] px-6">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={cn("flex gap-1 justify-end")}>
        <Button
          size="icon-sm"
          variant="outline"
          disabled={!hasPrev}
          onClick={prev}
          className={cn("disabled:bg-gray-500")}
        >
          <ArrowLeft className={cn("w-2 h-2")} />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          disabled={!hasNext}
          onClick={next}
          className={cn("disabled:bg-gray-500")}
        >
          <ArrowRight className={cn("w-2 h-2")} />
        </Button>
      </div>
    </div>
  );
};

export default DataTable;
