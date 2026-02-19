import DataTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import ChooseMenu from "@/features/ChooseMenu";
import ContractorForm from "@/features/ContractorForm";
import { ContractorColumns } from "@/features/ContractorsColumnDef";
import { cn } from "@/lib/utils";
import { getContractors } from "@/services/contractorService";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const Contractor = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [isActive, setIsActive] = useState<{
    name: string;
    value: boolean | undefined;
  }>({ name: "All", value: undefined });

  const { data, isLoading, error } = useQuery({
    queryKey: ["contractors", page, search, isActive.value],
    queryFn: () =>
      getContractors({ page: page, isActive: isActive.value, search: search }),
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

  const prevPage = useCallback(() => {
    if (!data || page <= 1) return;

    setPage(page - 1);
  }, [data, page]);

  const nextPage = useCallback(() => {
    if (!data || page >= data.pagination.totalPages) return;

    setPage(page + 1);
  }, [data, page]);

  const toolBar = useMemo(() => {
    const hasIsActiveFilter = isActive.value !== undefined;
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
          <div className="relative">
            <ChooseMenu
              options={[
                { name: "All", value: undefined },
                { name: "Active", value: true },
                { name: "Inactive", value: false },
              ]}
              state={isActive.value}
              handleSelect={setIsActive}
              disabled={disable}
              label="Status"
            />
            {hasIsActiveFilter && (
              <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                *{" "}
              </span>
            )}
          </div>
        </div>
        <ContractorForm />
      </div>
    );
  }, [inputValue, isActive.value, isLoading, handleTextChange]);

  return (
    <div className="px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Contractors</h1>
        <p className="text-muted-foreground">
          Manage your organization's contractors
        </p>
      </div>
      <DataTable
        columns={ContractorColumns}
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

export default Contractor;
