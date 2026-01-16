import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Invoice } from "@/services/tokenService";
import type { ColumnDef } from "@tanstack/react-table";

export const InvoiceColumns: ColumnDef<Invoice>[] = [
  {
    id: "contractorName",
    accessorFn(row) {
     return `${row.contractor.name.toUpperCase()}` 
    },
    header: "Contractor",
  },
  {
    id: "supervisorName",
    accessorFn(row) {
      return `${row.supervisor.firstName} ${row.supervisor.lastName}`
    },
    header: "Supervisor"
  },
  {
    id: "supervisorLagId",
    accessorFn(row) {
      return `${row.supervisor.lagId}`
    },
    header: "Supervisor's Lagos ID"
  },
  {
    id: "siteName",
    accessorFn(row) {
      return `${row.site.name.toUpperCase()}`
    },
    header: "Site"
  },
  {
    accessorKey: "cost",
    cell({row}) {
      const amount = row.original.cost
      return <span>{formatCurrency(amount)}</span>
    },
    header: "Cost"
  },
  {
    accessorKey: "quantity",
    header: "Quantity"
  },
  {
    accessorKey: "createdAt",
    cell({row}) {
      const date = new Date(row.original.createdAt)
      return <span>{formatDateTime(date)}</span>
    },
    header: "Created At"
  }
]
