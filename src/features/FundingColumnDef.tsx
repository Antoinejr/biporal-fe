import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Payment } from "@/services/paymentService";
import type { ColumnDef } from "@tanstack/react-table";

export const FundingColumns: ColumnDef<Payment>[] = [
  {
    id: "contractorName",
    accessorFn(row) {
     return `${row.contractor.name.toUpperCase()}` 
    },
    header: "Contractor",
  },
  {
    accessorKey: "email",
    header: "Email"
  },
  {
    id: "siteName",
    accessorFn(row) {
      return `${row.site.name.toUpperCase()}`
    },
    header: "Site"
  },
  {
    accessorKey: "amount",
    cell({row}) {
      const amount = row.original.amount
      return <span>{formatCurrency(amount)}</span>
    },
    header: "Amount"
  },
  {
    accessorKey: "paidAt",
    cell({row}) {
      const paidAt = row.original.paidAt;
      return <span>{formatDateTime(new Date(paidAt))}</span>
    },
    header: "Paid At"
  }
]
