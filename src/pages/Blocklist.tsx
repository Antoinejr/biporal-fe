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
import { Input } from "@/components/ui/input";
import BlockForm from "@/features/BlockForm";
import SiteEnrollForm from "@/features/SiteEnrollForm";
import SiteForm from "@/features/SiteForm";
import { cn } from "@/lib/utils";
import {
  fetchEntries,
  removeFromBlocklist,
  type BlockListEntry,
} from "@/services/blocklistService";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader, MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

const BlockListActions = ({ person }: { person: BlockListEntry }) => {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
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
};

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
    header: "Number of times blocked",
    accessorKey: "timesBlocked",
  },
  {
    id: "actions",
    cell({ row }) {
      return <BlockListActions person={row.original} />;
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
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => mutation.mutate({ lagId })}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader className="ml-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>Confirm Restoration</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Blocklist() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [inputValue, setInputValue] = useState(search);
  const timeoutRef = useRef<number | undefined>(undefined);

  const { data, isLoading, error } = useQuery({
    queryKey: ["blocklist", page, search],
    queryFn: () => fetchEntries({ page, search }),
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

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const newTimeout = setTimeout(() => {
        setSearch(value);
        setPage(1);
      }, 1000);
      timeoutRef.current = newTimeout;
    },
    [setSearch, setPage],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const toolBar = useMemo(() => {
    const disable = isLoading || !!error;
    return (
      <div className={cn("flex gap-1 justify-between")}>
        <div className={cn("flex gap-1 min-w-md")}>
          <Input
            value={inputValue}
            onChange={handleTextChange}
            placeholder="Search..."
            className={cn("bg-white", "max-w-sm")}
            disabled={disable}
          />
        </div>
        <div className={cn("flex gap-1")}>
          <BlockForm />
        </div>
      </div>
    );
  }, [inputValue, isLoading, handleTextChange]);

  const totalPages = data?.metadata.totalPages ?? 1;
  return (
    <div className="px-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Blocklist</h1>
        <p className="text-muted-foreground">
          View and manage individuals currently restricted from entering the
          premises
        </p>
      </header>
      <DataTable
        columns={BlocklistColumns}
        toolBar={toolBar}
        data={data?.data ?? []}
        loading={isLoading}
        error={error}
        next={goNext}
        prev={goPrev}
        hasNext={page < totalPages}
        hasPrev={page > 1}
      />
    </div>
  );
}
export default Blocklist;
