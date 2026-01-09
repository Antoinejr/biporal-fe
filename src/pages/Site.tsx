import DataTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { SiteColumns } from "@/features/SiteColumnDef";
import SiteEnrollForm from "@/features/SiteEnrollForm";
import SiteForm from "@/features/SiteForm";
import { cn } from "@/lib/utils";
import { getSites } from "@/services/siteService";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const Site = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["sites", page, search],
    queryFn: () => getSites({ page: page, search: search }),
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

  // NOTE: disable search if there are errors
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
        <div className={cn("flex gap-1")}>
          <SiteForm />
          <SiteEnrollForm />
        </div>
      </div>
    );
  }, [inputValue, isLoading, handleTextChange]);
  return (
    <div className="px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
        <p className="text-muted-foreground">
          Manage your organization's sites
        </p>
      </div>
      <DataTable
        columns={SiteColumns}
        data={data?.data ?? []}
        loading={isLoading}
        error={error}
        toolBar={toolBar}
        next={nextPage}
        prev={prevPage}
        hasNext={data ? page < data.pagination.totalPages : false}
        hasPrev={page > 1}
      />
    </div>
  );
};

export default Site;
