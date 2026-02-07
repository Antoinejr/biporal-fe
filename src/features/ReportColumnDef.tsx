import CategoryBadge from "@/components/category-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LogReport } from "@/lib/dashboardType";
import { cn, formatDateTime } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, CheckCircle } from "lucide-react";

export const ReportLogsColumns: ColumnDef<LogReport>[] = [
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell({ row }) {
      return formatDateTime(new Date(row.original.createdAt));
    },
  },
  {
    id: "fullName",
    header: "Name",
    cell({ row }) {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      const isPersonFlagged = row.original.isLate || row.original.hasNotLeft;
      const cell = `${firstName.toUpperCase()} ${lastName.toUpperCase()}`;
      return (
        <span className={cn(isPersonFlagged ? "text-red-500" : "")}>
          {cell}
        </span>
      );
    },
  },
  {
    accessorKey: "lagId",
    header: "Lag ID",
    cell: (ctx) => `${ctx.row.original.lagId ?? "N/A"}`,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell({ row }) {
      return <CategoryBadge value={row.original.category} />;
    },
  },
  {
    accessorKey: "siteName",
    header: "Site",
    cell({ row }) {
      return (row.original.siteName ?? "N/A").toUpperCase();
    },
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
  {
    accessorKey: "isLate",
    header: "Late Exit",
    cell({row}) {
      return (
        row.original.isLate ? (
          <span>Yes</span>
        ) : (
          <span>No</span>
        )
    )}
  },
  {
    accessorKey: "hasNotLeft",
    header: "Has Not Left",
    cell({row}) {
      return (
        row.original.hasNotLeft ? (
          <span>Yes</span>
        ) : (
          <span>No</span>
        )
    )}
  }
];
