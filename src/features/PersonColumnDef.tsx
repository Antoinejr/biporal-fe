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

const getRemainingDays = (date: string | Date) => {
  const today = new Date();
  const expiration = typeof date === "string" ? new Date(date) : date;
  const diffMs = expiration.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

const ExpirationTag = ({ isExpired }: { isExpired: boolean }) => {
  return (
    <div>
      {isExpired ? (
        <span className="bg-grey-500 text-red-600 p-2 rounded-sm">Expired</span>
      ) : (
        <></>
      )}
    </div>
  );
};

const PersonActions = ({ person }: { person: Person }) => {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/persons/d/${person.id}`)}>
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
};

export const PersonColumns: ColumnDef<Person>[] = [
  {
    id: "name",
    accessorFn: (row) => {
      const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      return `${capitalize(row.firstName)} ${capitalize(row.lastName)}`;
    },
    header: "Name",
  },
  {
    accessorKey: "lagId",
    header: "Lag ID",
    cell: ({ row }) => row.original.lagId || "N/A",
  },
  {
    accessorKey: "mobile",
    header: "Phone",
  },
  {
    id: "daysLeft",
    header: "Valid For (Days)",
    accessorFn: (row) => getRemainingDays(row.expirationDate),
    cell: ({ getValue }) => {
      const daysLeft = getValue<number>();
      return (
        <span className={cn(daysLeft <= 14 && "text-red-600 font-bold")}>
          {daysLeft} {daysLeft === 1 ? "day" : "days"} remaining
        </span>
      );
    },
  },
  {
    id: "expiredTag",
    header: "",
    accessorFn: (row) => getRemainingDays(row.expirationDate),
    cell: ({ getValue }) => (
      <ExpirationTag isExpired={getValue<number>() === 0} />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <PersonActions person={row.original} />,
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
