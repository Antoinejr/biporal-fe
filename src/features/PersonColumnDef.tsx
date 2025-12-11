import type { Person } from "@/lib/personTypes";
import type { ColumnDef } from "@tanstack/react-table";

export const PersonColumns: ColumnDef<Person>[] = [
  {
    id: "fullName",
    accessorFn: (row) => {
      const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      return `${capitalize(row.firstName)} ${capitalize(row.lastName)}`;
    },
    header: "Full Name",
  },
  {
    accessorKey: "lagId",
    header: "Lag ID",
    cell: ({ row }) => row.original.lagId || "N/A",
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
];
