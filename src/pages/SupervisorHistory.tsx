import DataTable from "@/components/data-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SupervisorHistoryColumns } from "@/features/PersonColumnDef";
import { cn } from "@/lib/utils";
import { getSupervisorHistory } from "@/services/personService";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Loader } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

function SupervisorHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Supervisor ID is missing</AlertDescription>
      </Alert>
    );
  }

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["supervisor-history", id, search],
    queryFn: () => getSupervisorHistory(id, { search }),
  });

  const [inputValue, setInputValue] = useState(search);
  const timeoutRef = useRef<number | undefined>(undefined);

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
      }, 500);
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

  const prevPage = useCallback(() => {
    if (!data) return;
    if (page <= 1) return;
    setPage(page - 1);
  }, [data, page]);

  const nextPage = useCallback(() => {
    if (!data) return;
    if (page >= data.pagination.totalPages) return;
    setPage(page + 1);
  }, [data, page]);

  const toolBar = useMemo(() => {
    return (
      <div className={cn("flex gap-1 justify-between")}>
        <div className={cn("flex gap-1 min-w-md")}>
          <Input
            value={inputValue}
            onChange={handleTextChange}
            placeholder="Search..."
            className={cn("bg-white", "max-w-sm")}
            disabled={isLoading}
          />
        </div>
      </div>
    );
  }, [inputValue, isLoading, handleTextChange]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load supervisor history. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("grid gap-10 container mx-auto max-w-full")}>
      <div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Supervisor History</h3>
      </div>
      <DataTable
        columns={SupervisorHistoryColumns}
        data={data?.data ?? []}
        loading={isLoading}
        toolBar={toolBar}
        error={error}
        next={nextPage}
        prev={prevPage}
        hasNext={false}
        hasPrev={false}
      />
    </div>
  );
}
export default SupervisorHistory;
