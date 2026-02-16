import CategoryBadge from "@/components/category-badge";
import type { Person } from "@/lib/personTypes";
import { cn, formatDate } from "@/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import PersonExtendDurationForm from "./PersonExtendDurationForm";
import { useNavigate } from "react-router";
import { Eye, HistoryIcon, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PersonStatusUpdate from "./PersonStatusUpdate";
import type { SupervisorHistory } from "@/services/personService";

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
    cell: ({ row }) => {
      return <CategoryBadge value={row.original.category} />;
    },
  },
  {
    accessorKey: "expirationDate",
    header: "Expiration Date",
    cell: ({ row }) => {
      return new Date(row.original.expirationDate).toDateString();
    },
  },
  {
    id: "daysLeft",
    header: "Remaining Days",
    accessorFn: (row) => {
      const today = new Date();
      const expiration = new Date(row.expirationDate);

      const diffMs = expiration.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return daysLeft;
    },
    cell: ({ getValue }) => {
      const daysLeft = getValue<number>();
      const daysLeftString = daysLeft.toString();
      return (
        <span
          className={cn(
            daysLeft <= 14 &&
              daysLeft > 0 &&
              "px-2 py-1 rounded-sm bg-red-700 font-bold text-white",
            daysLeft <= 0 && "px-2 py-1 rounded-sm bg-gray-400 text-red-700",
          )}
        >
          {daysLeft > 0 ? daysLeftString : "Expired"}
        </span>
      );
    },
  },
  {
    accessorKey: "deletedAt",
    header: "Status",
    cell: ({ row }) => {
      const person = row.original;
      return (
        <span
          className={cn(
            "px-2 py-1 rounded-sm text-sm",
            person.deletedAt
              ? "bg-red-100 text-red-700"
              : "bg-green-100  text-green-700",
          )}
        >
          {person.deletedAt ? "Inactive" : "Active"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const person = row.original;
      const navigate = useNavigate();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate(`/persons/d/${person.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate(`/persons/d/history/${person.id}`)}
            >
              <HistoryIcon className="mr-2 h-4 w-4" />
              View History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <PersonExtendDurationForm person={person} />
            <DropdownMenuSeparator />
            <PersonStatusUpdate person={person} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const SupervisorHistoryColumns: ColumnDef<SupervisorHistory>[] = [
  {
    header: "Site",
    accessorKey: "siteName",
    cell({ row }) {
      const siteName = row.original.siteName;
      return (siteName ?? "N/A").toUpperCase();
    },
  },
  {
    header: "Contractor",
    accessorKey: "contractorName",
    cell({ row }) {
      const contractorName = row.original.contractorName;
      return (contractorName ?? "N/A").toUpperCase();
    },
  },
  {
    header: "Start Date",
    accessorKey: "firstDate",
    cell({ row }) {
      let display: string = "N/A";
      const startDate = row.original.startDate;
      if (startDate) {
        display = formatDate(new Date(startDate));
      }
      return display;
    },
  },
  {
    header: "End Date",
    accessorKey: "endDate",
    cell({ row }) {
      let display: string = "N/A";
      const endDate = row.original.endDate;
      if (endDate) {
        display = formatDate(new Date(endDate));
      }
      return display;
    },
  },
];
