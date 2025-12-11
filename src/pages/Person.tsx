import DataTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import ChooseMenu from "@/features/ChooseMenu";
import { PersonColumns } from "@/features/PersonColumnDef";
import PersonForm from "@/features/PersonForm";
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["persons", page, search, isActive],
    queryFn: () =>
      getPersons({ page: page, isActive: isActive.value, search: search }),
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
          <ChooseMenu
            options={[
              { name: "All", value: undefined },
              { name: "Active", value: true },
              { name: "Inactive", value: false },
            ]}
            state={isActive.value}
            handleSelect={setIsActive}
            label="Status"
          />
        </div>
        <PersonForm />
      </div>
    );
  }, [inputValue, isLoading, isActive, handleTextChange, setIsActive]);

  return (
    <div>
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
