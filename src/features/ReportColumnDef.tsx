import CategoryBadge from "@/components/category-badge";
import type { LogReport } from "@/lib/dashboardType";
import { cn, formatDateTime } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

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
    accessorKey: "isLate",
    header: "Late Exit",
    cell({ row }) {
      const isLate = row.original.isLate;
      const isRejected = row.original.isRejected;

      if (isRejected) {
        return "N/A";
      } else {
        if (isLate) {
          return "Yes";
        } else {
          return "No";
        }
      }
    },
  },
  {
    accessorKey: "hasNotLeft",
    header: "Still In",
    cell({ row }) {
      const hasNotLeft = row.original.hasNotLeft;
      const isRejected = row.original.isRejected;

      if (isRejected) {
        return "N/A";
      } else {
        if (hasNotLeft) {
          return "Yes";
        } else {
          return "No";
        }
      }
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
  },
];
