import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SiteType } from "@/lib/siteTypes";
import { formatCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router";
import SiteDisengage from "./SiteDisengage";

export const SiteColumns: ColumnDef<SiteType>[] = [
  {
    id: "name",
    accessorFn(row) {
      return row.name.toUpperCase();
    },
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
      return formatCurrency(row.original.balance);
    },
  },
  {
    accessorKey: "contractors",
    header: "Contractor",
    cell: ({ row }) => {
      let contractor: string | undefined;
      if (row.original.contractors.length > 0) {
        contractor = row.original.contractors[0].name ?? "N/A";
      }
      return `${contractor?.toUpperCase() ?? "N/A"}`;
    },
  },
  {
    accessorKey: "owner",
    header: "Site Owner",
    cell({row}) {
      const owner = row.original.owner;
      return `${owner}`
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const site = row.original;
      const navigate = useNavigate();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-8 p-0">
              <span className="sr-only">Open Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/sites/${site.id}`)}>
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SiteDisengage site={site} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
