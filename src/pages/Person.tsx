import DataTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { PersonColumns } from "@/features/PersonColumnDef";
import PersonForm from "@/features/PersonForm";
import type { Category } from "@/lib/activityLogsTypes";
import { cn } from "@/lib/utils";
import { getPersons } from "@/services/personService";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router";

const Person = () => {
  const { category } = useParams();
  const navigator = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["persons", page, search, category],
    queryFn: () =>
      getPersons({
        page: page,
        search: search,
        category: category as Category,
      }),
  });

  const [inputValue, setInputValue] = useState(search);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (category !== "SUPERVISOR") {
      navigator("not-found", { replace: true });
    }
  }, []);

  const pageName = useMemo(() => {
    const splitstring = location.pathname.split("/");
    const length = splitstring.length;
    return splitstring[length - 1];
  }, [location.pathname]);

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
        <PersonForm category={category as Category} />
      </div>
    );
  }, [inputValue, isLoading, handleTextChange, category]);

  return (
    <div className="px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{pageName}</h1>
        <p className="text-muted-foreground">
          Manage your organization's registered persons.
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
