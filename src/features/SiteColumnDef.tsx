import type { SiteType } from "@/lib/siteTypes";
import { formatAsCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

export const SiteColumns: ColumnDef<SiteType>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      formatAsCurrency(row.original.balance);
    },
  },
];
