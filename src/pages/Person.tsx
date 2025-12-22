import DataTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import ChooseMenu from "@/features/ChooseMenu";
import { PersonColumns } from "@/features/PersonColumnDef";
import PersonForm from "@/features/PersonForm";
import type { Category } from "@/lib/activityLogsTypes";
import { cn } from "@/lib/utils";
import { getPersons } from "@/services/personService";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const Person = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [isActive, setIsActive] = useState<{
    name: string;
    value: boolean | undefined;
  }>({ name: "All", value: undefined });
  const [categoryState, setCategory] = useState<{
    name: string;
    value: Category | undefined;
  }>({ name: "All", value: undefined });

  const { data, isLoading, error } = useQuery({
    queryKey: ["persons", page, search, isActive, categoryState],
    queryFn: () =>
      getPersons({
        page: page,
        isActive: isActive.value,
        search: search,
        category: categoryState.value,
      }),
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
    const hasIsActiveFilter = isActive.value !== undefined;
    const hasCategoryFilter = categoryState.value !== undefined;

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

          <div className="relative">
            <ChooseMenu
              options={[
                { name: "All", value: undefined },
                { name: "Active", value: true },
                { name: "Inactive", value: false },
              ]}
              state={isActive.value}
              handleSelect={setIsActive}
              disabled={isLoading}
              label="Status"
            />
            {hasIsActiveFilter && (
              <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                *
              </span>
            )}
          </div>
          <div className="relative">
            <ChooseMenu
              options={[
                { name: "All", value: undefined },
                { name: "Resident", value: "RESIDENT" as Category },
                { name: "Worker", value: "WORKER" as Category },
                { name: "Dependent", value: "DEPENDENT" as Category },
                { name: "Supervisor", value: "SUPERVISOR" as Category },
              ]}
              state={categoryState.value}
              handleSelect={setCategory}
              disabled={isLoading}
              label="Category"
            />
            {hasCategoryFilter && (
              <span className="absolute -top-1 -right-1 text-red-500 text-lg">
                *
              </span>
            )}
          </div>
        </div>
        <PersonForm />
      </div>
    );
  }, [inputValue, isActive.value, categoryState.value, isLoading]);

  return (
    <div className="px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Persons</h1>
        <p className="text-muted-foreground">
          Manage your organization's Residents, and others
        </p>
      </div>
      <DataTable
        columns={PersonColumns}
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

export default Person;
