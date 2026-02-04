import { formatDateTime } from "@/lib/utils";
import type { Defaulter } from "@/services/defaultersService";
import type { ColumnDef } from "@tanstack/react-table";

export const DefaultersColumns: ColumnDef<Defaulter>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell({row}) {
      formatDateTime(new Date(row.original.timestamp))
    }
  },
  {
    id: "fullName",
    header: "Name",
    accessorFn(row) {
      return `${row.firstName.toUpperCase()} ${row.lastName.toUpperCase()}`
    }
  },
  {
    accessorKey: "lagId",
    header: "Lagos ID"
  },
  {
    accessorKey: "site",
    header: "Site",
    accessorFn(row) {
      return `${row.site.toUpperCase()}`
    }
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell({row}) {
      const reason = row.original.reason;
      switch(reason) {
        case "NO_TAPOUT":
          return 'Person is still in pass the exit time';
        case "LATE_TAPOUT":
          return "Person left the premises late"
        default:
          return "Should not get here, Unknown reason"
      }
    }
  }
]
