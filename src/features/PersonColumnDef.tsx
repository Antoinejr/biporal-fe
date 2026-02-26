import type { Person } from "@/lib/personTypes";
import { cn, formatDate } from "@/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import PersonExtendDurationForm from "./PersonExtendDurationForm";
import { useNavigate } from "react-router";
import {
  Ban,
  CheckCircle,
  Eye,
  HistoryIcon,
  MoreHorizontal,
  RulerDimensionLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PersonStatusUpdate from "./PersonStatusUpdate";
import type { SupervisorHistory } from "@/services/personService";
import { useState } from "react";

const getRemainingDays = (date: string | Date) => {
  const today = new Date();
  const expiration = typeof date === "string" ? new Date(date) : date;
  const diffMs = expiration.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

const BlockedTag = ({ isBlocked }: { isBlocked: boolean }) => {
  if (!isBlocked) {
    return null;
  }
  return (
    <span className="bg-grey-500 text-red-600 p-2 rounded-sm">Blocked</span>
  );
};

const ExpirationTag = ({ isExpired }: { isExpired: boolean }) => {
  if (!isExpired) {
    return null;
  }
  return (
    <div>
      <span className="bg-grey-500 text-red-600 p-2 rounded-sm">Expired</span>
    </div>
  );
};

const PersonActions = ({ person }: { person: Person }) => {
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const navigate = useNavigate();
  return (
    <div>
      <PersonExtendDurationForm
        show={showExtensionDialog}
        setShow={setShowExtensionDialog}
        person={person}
      />

      <PersonStatusUpdate
        show={showBlockDialog}
        setShow={setShowBlockDialog}
        person={person}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem
            onSelect={() => navigate(`/persons/d/${person.id}`)}
          >
            <Eye className="h-4 w-4" />
            Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => navigate(`/persons/d/history/${person.id}`)}
          >
            <HistoryIcon className="h-4 w-4" />
            History
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setShowExtensionDialog(true)}>
            <RulerDimensionLine className="h-4 w-4" />
            Extend
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setShowBlockDialog(true)}>
            {person.deletedAt ? (
              <>
                <CheckCircle className="w-4 h-4" /> Activate
              </>
            ) : (
              <>
                <Ban className="w-4 h-4" /> Deactivate
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
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
    id: "blockedTag",
    header: "",
    cell: ({ row }) => <BlockedTag isBlocked={!!row.original.deletedAt} />,
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
