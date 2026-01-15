import type { ActivitiyLog } from "@/lib/activityLogsTypes";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, CheckCircle } from "lucide-react";
import CategoryBadge from "@/components/category-badge";

export const ActivityLogsColumns: ColumnDef<ActivitiyLog>[] = [
  {
    id: "fullName",
    accessorFn: (row) =>
      `${row.firstName.toUpperCase()} ${row.lastName.toUpperCase()}`,
    header: "Name",
  },
  {
    accessorKey: "lagId",
    header: "Lag ID",
    cell: (ctx) => `${ctx.row.original.lagId ?? "N/A"}`,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return <CategoryBadge value={category}/>;
    },
  },
  {
    accessorKey: "site",
    header: "Site",
    cell: (ctx) => `${ctx.row.original.site ?? "N/A"}`,
  },
  {
    accessorKey: "action",
    header: "Type",
    cell: ({ row }) => {
      const action = row.original.action;
      const isIn = action === ("IN" as const);

      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
            isIn
              ? "bg-blue-100 text-blue-800 border border-blue-200"
              : "bg-purple-100 text-purple-800 border border-purple-200"
          }`}
        >
          {isIn ? "↓ Entry" : "↑ Exit"}
        </span>
      );
    },
  },

  {
    accessorKey: "isRejected",
    header: "Access",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded text-sm ${
          row.original.isRejected
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {row.original.isRejected ? "Rejected" : "Granted"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: "outOfOrder",
    header: "Sequence Status",
    cell: ({ row }) => {
      const isOutOfOrder = row.original.isOutOfOrder;
      const action = row.original.action;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-help ${
                  isOutOfOrder
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {isOutOfOrder ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                <span className="text-xs font-medium">
                  {isOutOfOrder ? "Irregular" : "Normal"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs">
                {isOutOfOrder
                  ? `Anomaly detected: Consecutive ${action}s without alternating pattern`
                  : "Actions are alternating as expected"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];
