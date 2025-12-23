import { Button } from "@/components/ui/button";
import type { SiteType } from "@/lib/siteTypes";
import { formatAsCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router";

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
      return formatAsCurrency(row.original.balance);
    },
  },
  {
    accessorKey: "contractors",
    header: "Contractor",
    cell: ({row}) => {
      let contractor: string | undefined;
      if (row.original.contractors.length > 0) {
        contractor = row.original.contractors[0].name ?? "N/A"
      }
      return `${contractor ?? "N/A"}`
    }
  },
  {
    id: "actions",
    cell: ({row}) => {
      const site = row.original;
      const navigate = useNavigate();
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/sites/${site.id}`)}
        >
        <Eye className="h-4 w-4" />
          View Details
        </Button>
      )
    }
  }
];
