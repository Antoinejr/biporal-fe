import CategoryBadge from "@/components/category-badge";
import type { Token } from "@/lib/tokenTypes";
import type { ColumnDef } from "@tanstack/react-table";

export const TokenColumns: ColumnDef<Token>[] =[
  {
    accessorKey: "fullName",
    header: "Full Name"
  },
  {
    accessorKey: "lagId",
    header: "Lag ID",
    cell: ({row}) => {
      const token = row.original;
      return `${token.lagId ?? "N/A"}`
    }
  },
  {
    accessorKey: "createdAt",
    header: "Issue Date",
    cell: ({row}) => {
      const token = row.original;
      return `${new Date(token.createdAt).toDateString()}`
      
    }
    
  },
  {
    accessorKey:"category",
    header: "Category",
    cell: ({row}) => {
      return <CategoryBadge value={row.original.category} />
    }
  },
  {
    accessorKey: "expirationDate",
    header: "Expiration Date",
    cell: ({row}) => {
      const token = row.original;
      return `${new Date(token.expirationDate).toDateString()}`
    }
  },
  {
    id: "supervisor",
    header: "Supervisor",
    cell: ({row}) => {
      const token = row.original;
      return `${token.supervisor?.fullName ?? "N/A"}`
    }
  },
  {
    id: "site",
    header: "Site",
    cell: ({row}) => {
      const token = row.original;
      return `${token.site?.name.toUpperCase() ?? "N/A"}`
    }
  }
]
