import type { ContractorType } from "@/lib/contractorTypes";
import type { ColumnDef } from "@tanstack/react-table";

export const ContractorColumns: ColumnDef<ContractorType>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "createdAt", header: "Created" },
];
