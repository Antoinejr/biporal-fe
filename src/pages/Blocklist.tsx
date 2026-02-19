import DataTable from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchEntries,
  removeFromBlocklist,
  type BlockListEntry,
} from "@/services/blocklistService";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader, MoreHorizontal } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";

const BlocklistColumns: ColumnDef<BlockListEntry>[] = [
  {
    header: "Name",
    accessorFn(row) {
      return `${row.firstName} ${row.lastName}`.toUpperCase();
    },
  },
  {
    header: "Lag ID",
    accessorKey: "lagId",
  },
  {
    header: "Times Blocked",
    accessorKey: "timesBlocked",
  },
  {
    id: "actions",
    cell({ row }) {
      const person = row.original;
      const navigate = useNavigate();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => navigate(`/notes/d/${person.id}!${person.lagId}`)}
            >
              View Notes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <RestorePerson
              name={`${person.firstName} ${person.lastName}`.toUpperCase()}
              lagId={person.lagId}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function RestorePerson({ name, lagId }: { name: string; lagId: string }) {
  const queryClient = useQueryClient();
  const [show, setShow] = useState(false);
  const mutation = useMutation({
    mutationFn: removeFromBlocklist,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["blocklist"],
      });
      setShow(false);
    },
  });

  function handleSubmit(p: { lagId: string }) {
    return () => mutation.mutate(p);
  }

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setShow(true);
          }}
        >
          Restore Person
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="font-bold text-lg">
          Confirm Restoration
        </DialogHeader>
        <DialogDescription>
          You are about to restore access for{" "}
          <span className="font-bold">{name}</span>.
          <br />
          This will allow them access into estate. Continue?
        </DialogDescription>
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit({ lagId })}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                Updating...
                <Loader className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>Confirm</>
            )}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Blocklist() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ["blocklist", page],
    queryFn: () => fetchEntries({ page }),
  });

  const goPrev = useCallback(() => {
    if (!data) return;
    if (page <= 1) return;
    setPage(page - 1);
  }, [data, page]);

  const goNext = useCallback(() => {
    if (!data) return;
    if (page >= data.metadata.totalPages) return;
    setPage(page + 1);
  }, [data, page]);

  return (
    <DataTable
      columns={BlocklistColumns}
      data={data?.data ?? []}
      loading={isLoading}
      error={error}
      next={goNext}
      prev={goPrev}
      hasNext={data ? page < data.metadata.totalPages : false}
      hasPrev={page > 1}
    />
  );
}
export default Blocklist;
