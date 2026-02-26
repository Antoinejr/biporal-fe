import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SiteType } from "@/lib/siteTypes";
import { formatCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleMinus, CirclePlus, Eye, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router";
import SiteDisengage from "./SiteDisengage";
import SiteEnrollForm from "./SiteEnrollForm";
import { useState } from "react";

const SiteActions = ({ site }: { site: SiteType }) => {
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [showRestoreForm, setShowRestoreForm] = useState(false);
  const navigate = useNavigate();
  return (
    <div>
      <SiteDisengage
        show={showBlockForm}
        setShow={setShowBlockForm}
        site={site}
      />
      <SiteEnrollForm
        show={showRestoreForm}
        setShow={setShowRestoreForm}
        site={site}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem onClick={() => navigate(`/sites/d/${site.id}`)}>
            <Eye className="h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {site.contractors.length > 0 ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setShowBlockForm(true)}
            >
              <CircleMinus className="w-4 h-4" />
              Remove Contractor
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => setShowRestoreForm(true)}>
              <CirclePlus className="h-4 w-4" />
              Add Contractor
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

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
    cell({ row }) {
      const owner = row.original.owner;
      return `${owner}`;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <SiteActions site={row.original} />,
  },
];
