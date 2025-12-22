import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ColumnConfig<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface GenericListProps<T extends { id: string }> {
  items: T[];
  columns: ColumnConfig<T>[];
  className?: string;
  emptyMessage?: string;
  showHeader?: boolean;
}

export function GenericList<T extends { id: string }>({
  items,
  columns,
  className,
  emptyMessage = "No items found.",
  showHeader = false,
}: GenericListProps<T>) {
  const getValue = (item: T, column: ColumnConfig<T>) => {
    if (column.render) {
      return column.render(item);
    }
    const value = item[column.key as keyof T];
    if (value === null || value === undefined) return "-";
    if (value instanceof Date) return value.toLocaleDateString();
    return String(value);
  };

  return (
    <ScrollArea className={cn("h-[400px] rounded-md border", className)}>
      <div className="p-4">
        {showHeader && (
          <div className="mb-4 flex items-center justify-between gap-4 border-b pb-2">
            {columns.map((column, index) => (
              <span
                key={String(column.key)}
                className={cn(
                  "text-sm font-semibold text-muted-foreground",
                  index === 0 && "flex-1",
                  column.headerClassName,
                )}
              >
                {column.header}
              </span>
            ))}
          </div>
        )}
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-md border p-3"
              >
                {columns.map((column, index) => (
                  <span
                    key={`${item.id}-${String(column.key)}`}
                    className={cn(
                      "text-sm",
                      index === 0 && "font-medium flex-1",
                      column.className,
                    )}
                  >
                    {getValue(item, column)}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </ScrollArea>
  );
}
