import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useCallback, useEffect, useRef, type JSX } from "react";
import DisplayError from "./error";
import DisplayLoading from "./loading";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { cn } from "@/lib/utils";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading: boolean;
  error: Error | null;
  fetchNextPage: () => void;
  toolBar?: JSX.Element;
};

const PagelessTable = <TData, TValue>({
  columns,
  data,
  error,
  loading,
  fetchNextPage,
  toolBar,
}: DataTableProps<TData, TValue>) => {
  const rootRef = useRef(null);
  const elementRef = useRef(null);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !loading) {
        fetchNextPage();
      }
    },
    [loading, fetchNextPage],
  );

  useEffect(() => {
    let observer: IntersectionObserver;
    if (rootRef?.current) {
      const options = {
        root: rootRef.current,
        rootMargin: "200px",
        threshold: 0.1,
      };
      observer = new IntersectionObserver(observerCallback, options);
      if (elementRef.current) {
        observer.observe(elementRef.current);
      }
    }
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observerCallback]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return (
      <DisplayError description="Failed to load information. Please try again" />
    );
  }

  if (loading && data.length === 0) {
    return <DisplayLoading />;
  }

  return (
    <div className={cn("grid grid-rows-[auto_1fr_auto]", "gap-2")}>
      {toolBar && toolBar}
      <ScrollArea className="max-h-[65vh]" ref={rootRef}>
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
            <TableRow ref={elementRef} className="border-none">
              <TableCell colSpan={columns.length} className="text-center">
                {loading && <DisplayLoading minimal />}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default PagelessTable;
