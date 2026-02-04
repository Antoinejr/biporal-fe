import type { ContractorType } from "@/lib/contractorTypes";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export const ContractorColumns: ColumnDef<ContractorType>[] = [
  { accessorKey: "name", header: "Name", cell: ({row}) => `${row.original.name.toUpperCase()}` },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "deletedAt",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={cn(
          "px-2 py-1 rounded-sm text-sm",
          row.original.deletedAt
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700",
        )}
      >
        {row.original.deletedAt ? "Inactive" : "Active"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contractor = row.original;
      const navigate = useNavigate();

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/contractors/d/${contractor.id}`)}
        >
          <Eye className="h-4 w-4" />
          View Details
        </Button>
      );
    },
  },
];
